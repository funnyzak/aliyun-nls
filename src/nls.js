'use strict';

const AliyunRPC = require('@alicloud/pop-core');
const Request = require('request-promise');
const chalk = require('chalk');

class AliyunNLS {
  constructor(appKey = '', rpcConfig = {}) {
    this.appKey = appKey;
    this.rpcConfig = {
      endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
      apiVersion: '2019-02-28',
      ...rpcConfig
    };
    this.client = new AliyunRPC(this.rpcConfig);

    this.tokenExpire =
      parseInt((new Date().getTime() / 1000).toString(), 10) - 10;
    this.token = '';
  }

  log(msg, level = 'info') {
    const message = typeof msg !== 'string' ? JSON.stringify(msg) : msg;

    const warning = (_message) => chalk`{yellow WARNING:} ${_message}`;
    const info = (_message) => chalk`{magenta INFO:} ${_message}`;
    const error = (_message) => chalk`{red ERROR:} ${_message}`;
    switch (level) {
      case 'error':
        this.log(error(message));
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
  task(text, options = {}) {
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

      const {
        appKey,
        format,
        sample_rate,
        voice,
        volume,
        speech_rate,
        pitch_rate,
        enable_subtitle,
        enable_notify,
        notify_url
      } = options || {};

      const requestConfig = {
        method: 'POST',
        uri: this.rpcConfig.endpoint,
        json: true,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          payload: {
            tts_request: {
              text,
              format: format || 'mp3',
              sample_rate: sample_rate || 16000,
              voice: voice || 50,
              volume: volume || 50,
              speech_rate: speech_rate ? (speech_rate - 50) * 10 : 50, // 0-100 to -500-50 format
              pitch_rate: pitch_rate ? (pitch_rate - 50) * 10 : 50,
              enable_subtitle
            },
            enable_notify: enable_notify || false,
            notify_url
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

      Request(requestConfig)
        .then((_rlt) => {
          this.log(`get task: ${JSON.stringify(_rlt)}`);

          if (_rlt.data.task_id) {
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
      const _config = {
        method: 'GET',
        uri: `${this.rpcConfig.endpoint}?appkey=${
          appKey || this.appKey
        }&task_id=${taskId}&token=${_token}`,
        json: true
      };

      Request(_config)
        .then((rlt) => {
          this.log(`task status: ${JSON.stringify(rlt)}.`);
          if (rlt.error_code !== 20000000) {
            reject(new Error(rlt.error_message));
          } else {
            resolve(rlt.data);
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
        this.log(err.message, 'error');
        reject(err);
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
      return (await this.taskSync('h', 2)).audio_address.length > 0;
    } catch (err) {
      return false;
    }
  }
}

module.exports = AliyunNLS;
