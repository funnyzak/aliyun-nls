'use strict';

const assert = require('assert');
const AliyunRPC = require('@alicloud/pop-core');
const RP = require('request-promise');
const chalk = require('chalk');

class AliyunNLS {
  constructor(config, appKey = '') {
    assert(config, 'must pass "config"');
    assert(config.accessKeyId, 'must pass "config.accessKeyId"');
    assert(config.accessKeySecret, 'must pass "config.accessKeySecret"');
    assert(config.nlsUrl, 'must pass "config.nlsUrl"');

    this.appKey = appKey;
    this.config = {
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
      apiVersion: '2019-02-28',
      ...config
    };
    this.client = new AliyunRPC(this.config);

    this.tokenExpire =
      parseInt((new Date().getTime() / 1000).toString(), 10) - 10;
    this.token = '';

    this.taskMap = {};
  }

  log(msg, level = 'info') {
    const message = typeof msg !== 'string' ? JSON.stringify(msg) : msg;

    const warning = (_message) => chalk`{yellow WARNING:} ${_message}`;
    const info = (_message) => chalk`{magenta INFO:} ${_message}`;
    const error = (_message) => chalk`{red ERROR:} ${_message}`;
    switch (level) {
      case 'error':
        console.info(error(message));
        break;
      case 'warn':
        console.warn(warning(message));
        break;
      default:
        console.info(info(message));
        break;
    }
  }
  /**
   * 获取token
   * @returns
   */
  getToken() {
    return new Promise((resolve, reject) => {
      if (
        this.token.length > 0 &&
        this.tokenExpire * 1000 > new Date().getTime()
      ) {
        resolve(this.token);
      } else {
        this.client
          .request('CreateToken', { Format: 'JSON' })
          .then((res) => {
            if (res.ErrMsg === '') {
              this.tokenExpire = res.Token.ExpireTime;
              this.token = res.Token.Id;
              this.log(`created token: ${JSON.stringify(res)}.`);
              resolve(res.Token.Id);
            } else {
              this.log(`create token fail, message: ${res.ErrMsg}.`, 'error');
              reject(new Error(res.ErrMsg));
            }
          })
          .catch((err) => {
            this.log(`create token error, message: ${err.message}.`, 'error');
            reject(err);
          });
      }
    });
  }

  /**
   * 合成任务，并获取任务ID
   * @param text 文本内容
   * @param options 转换选项
   * @returns
   */
  task(text, options, appKey) {
    return new Promise(async (resolve, reject) => {
      if (!text || text === null || text.length === 0) {
        this.log(`nls text cant's null.`, 'warn');
        reject(new Error('please set text.'));
        return;
      }
      let _token = '';
      try {
        _token = await this.getToken();
      } catch (err) {
        reject(err);
        return;
      }

      const _options = {
        format: 'mp3',
        sample_rate: 16000,
        voice: 'xiaoyun',
        volume: 50,
        enable_notify: false,
        speech_rate: 50,
        pitch_rate: 50,
        ...options
      };

      const requestConfig = {
        method: 'POST',
        uri: this.config.nlsUrl,
        json: true,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          payload: {
            tts_request: {
              text,
              format: _options.format,
              sample_rate: _options.sample_rate,
              voice: _options.voice,
              volume: _options.volume,
              speech_rate: _options.speech_rate
                ? (_options.speech_rate - 50) * 10
                : 50, // 0-100 to -500-50 format
              pitch_rate: _options.pitch_rate
                ? (_options.pitch_rate - 50) * 10
                : 50,
              enable_subtitle: _options.enable_subtitle
            },
            enable_notify: _options.enable_notify,
            notify_url: _options.notify_url
          },
          context: {
            device_id: (Math.random() + 1).toString(36).substring(7)
          },
          header: {
            appkey: appKey || this.appKey,
            token: _token
          }
        }
      };

      this.log(`request config: ${JSON.stringify(requestConfig)}`);
      const _startTime = new Date().getTime();

      RP(requestConfig)
        .then((_rlt) => {
          this.log(`get task: ${JSON.stringify(_rlt)}`);

          if (_rlt.data.task_id) {
            this.taskMap[_rlt.data.task_id] = {
              options: _options,
              text: text,
              startTime: _startTime
            };

            resolve(_rlt.data.task_id);
          } else {
            reject(new Error('requested and get task id is null.'));
          }
        })
        .catch((_err) => {
          this.log(_err.message, 'error');
          reject(_err);
        });
    });
  }

  /**
   * 获取转换状态
   * @param taskId
   * @param appKey
   * @returns
   */
  status(taskId, appKey) {
    return new Promise(async (resolve, reject) => {
      let _token = '';
      try {
        _token = await this.getToken();
      } catch (err) {
        reject(err);
        return;
      }
      const _appKey = appKey || this.appKey;
      const _config = {
        method: 'GET',
        uri: `${this.config.nlsUrl}?appkey=${_appKey}&task_id=${taskId}&token=${_token}`,
        json: true
      };

      RP(_config)
        .then((rlt) => {
          this.log(`task status: ${JSON.stringify(rlt)}.`);
          if (rlt.error_code !== 20000000) {
            reject(new Error(rlt.error_message));
          } else {
            const rltData = rlt.data;
            const isComplete =
              rltData.audio_address !== null &&
              rltData.audio_address.length > 0;
            resolve({
              ...rlt.data,
              ...this.taskMap[taskId],
              appKey: _appKey,
              elapsed: isComplete
                ? new Date().getTime() - this.taskMap[taskId].startTime
                : -1
            });
          }
        })
        .catch((err) => {
          this.log(`request task status error: ${err.message}.`, 'error');
          reject(err);
        });
    });
  }

  /**
   * 同步完成转换
   * @param text 文字
   * @param options 转换配置
   * @param 轮训时间 秒
   */
  taskSync(text, options = {}, interval = 2) {
    return new Promise(async (resolve, reject) => {
      let taskId = '';
      try {
        taskId = await this.task(text, options);
      } catch (err) {
        reject(err);
        return;
      }

      const _interval = setInterval(async () => {
        try {
          let rlt;
          try {
            rlt = await this.status(taskId);
          } catch (err) {
            clearInterval(_interval);
            reject(err);
            return;
          }
          if (rlt.audio_address !== null && rlt.audio_address.length > 0) {
            clearInterval(_interval);
            resolve(rlt);
          }
        } catch (err) {
          clearInterval(_interval);
          reject(err);
        }
      }, interval * 1000);
    });
  }

  /**
   *检查配置
   * @returns
   */
  async checkConfig() {
    try {
      await this.getToken();
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = AliyunNLS;
