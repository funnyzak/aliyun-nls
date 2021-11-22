import RPCClient from '@alicloud/pop-core';

// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note that ES6 modules cannot directly export class objects.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

declare class AliyunTTS {
  /**
   *应用Key
   *
   * @type {string}
   * @memberof AliTTS
   */
  appKey: string;
  /**
   *密钥配置
   *
   * @type {RpcConfig}
   * @memberof AliTTS
   */
  rpcConfig: AliyunTTS.Config;

  /**
   *客户端
   *
   * @type {RPCClient}
   * @memberof AliTTS
   */
  client: RPCClient;

  /**
   *Token 值
   *
   * @type {string}
   * @memberof AliyunNLS
   */
  token: string;

  /**
   *token 过期时间
   *
   * @type {number}
   * @memberof AliyunNLS
   */
  tokenExpire: number;

  constructor(rpcConfig: AliyunTTS.Config, appKey?: string);

  /**
   * debug log
   * @param message
   * @param level
   */
  log(message: Object, level: string): void;

  /**
   * 获取token
   * @returns
   */
  getToken(): Promise<string>;

  /**
   * 开始转换任务，并获取任务ID
   * @param text 文本内容
   * @param options 转换选项
   * @returns
   */
  task(text: string, options?: AliyunTTS.TTSOption): Promise<string>;

  /**
   * 获取转换状态
   * @param taskId
   * @param appKey
   * @returns
   */
  status(taskId: string, appKey?: string): Promise<AliyunTTS.TTSComplete>;

  /**
   * 同步完成转换
   * @param text 文字
   * @param options 转换配置
   * @param 轮训时间 秒
   */
  taskSync(
    text: string,
    options: AliyunTTS.TTSOption,
    interval?: number
  ): Promise<AliyunTTS.TTSComplete>;
  /**
   *检查配置
   * @returns
   */
  checkConfig(): Promise<boolean>;
}

declare namespace AliyunTTS {
  export interface Config extends RPCClient.Config {
    nlsUrl: string;
  }

  /**
   * 长语音合成参数
   */
  export interface TTSOption {
    appKey?: string;
    /**
     * 音频编码格式，支持pcm/wav/mp3格式，默认是pcm。
     */
    format?: string;
    /**
     * 音频采样率，支持16000Hz和8000Hz，默认是16000Hz。
     */
    sample_rate?: number;
    /**
     * 发音人，默认是xiaoyun。更多发音人请参见接口说明。 https://help.aliyun.com/document_detail/130509.htm?spm=a2c4g.11186623.0.0.442a38adeflvK0#topic-2606811
     */
    voice?: string;
    /**
     * 音量，范围是0~100，默认50。
     */
    volume?: number;
    /**
     * 语速，范围是0-100，默认是50。
     */
    speech_rate?: number;
    /**
     * 语调，范围是0-100，默认是50。
     */
    pitch_rate?: number;
    /**
     * 是否启用句级时间戳功能，默认值为false。
     */
    enable_subtitle?: boolean;
    /**
     * 是否启用回调功能，默认值为false。
     */
    enable_notify?: boolean;
    /**
     * 回调服务的地址。当enable_notify取值为true时，本字段必填。
     * URL支持HTTP/HTTPS协议，Host不能使用IP地址。
     */
    notify_url?: string;
  }
  /**
   * 合成的返回数据定义
   */
  export interface TTSComplete {
    /**
     * 返回的任务ID
     */
    task_id: string;
    /**
     * 合成的音频URL
     */
    audio_address: string;
    /**
     * 回调地址
     */
    notify_custom: string;
    /**
     * 句级时间戳对象
     */
    sentences: any;

    /**
     * 使用的APP Key
     */
    appKey: string;

    /**
     * 合成选项
     */
    options: TTSOption;

    /**
     * 合成文本
     */
    text: string;

    /**
     * 开始时间（毫秒时间戳）
     */
    startTime: number;

    /**
     * 合成耗时（毫秒）
     */
    elapsed: number;
  }
}

export = AliyunTTS;
