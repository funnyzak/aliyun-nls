# AliYun NLS

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![action][ci-image]][ci-url]
[![license][license-image]][repository-url]
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[ci-image]: https://img.shields.io/github/workflow/status/funnyzak/aliyun-nls/Node.js%20CI
[ci-url]: https://github.com/funnyzak/aliyun-nls/actions
[license-image]: https://img.shields.io/github/license/funnyzak/aliyun-nls.svg?style=flat-square
[repository-url]: https://github.com/funnyzak/aliyun-nls
[npm-image]: https://img.shields.io/npm/v/@funnyzak/aliyun-nls.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@funnyzak/aliyun-nls
[download-image]: https://img.shields.io/npm/dm/@funnyzak/aliyun-nls.svg?style=flat-square
[download-url]: https://npmjs.org/package/@funnyzak/aliyun-nls

阿里云自然语言处理 Node 模块。


## 目录

- [AliYun NLS](#aliyun-nls)
  - [目录](#目录)
  - [开始](#开始)
  - [长文本合成](#长文本合成)
    - [用例](#用例)
    - [函数](#函数)
      - [`checkConfig(): Promise<boolean>`](#checkconfig-promiseboolean)
      - [`task(text: string, options?: AliyunTTS.TTSOption): Promise<string>`](#tasktext-string-options-aliyunttsttsoption-promisestring)
      - [`status(taskId: string, appKey?: string): Promise<AliyunTTS.TTSComplete>`](#statustaskid-string-appkey-string-promisealiyunttsttscomplete)
      - [`taskSync(text: string, options: AliyunTTS.TTSOption, interval?: number): Promise<AliyunTTS.TTSComplete>;`](#tasksynctext-string-options-aliyunttsttsoption-interval-number-promisealiyunttsttscomplete)
    - [定义](#定义)
      - [AliyunTTS.TTSOption](#aliyunttsttsoption)
      - [AliyunTTS.TTSComplete](#aliyunttsttscomplete)
  - [Author](#author)
  - [参考](#参考)
  - [License](#license)

## 开始

from [npm](https://github.com/npm/npm)

    $ npm install @funnyzak/aliyun-nls

## 长文本合成

### 用例

```js
const { AliyunTTS } = require('@funnyzak/aliyun-nls');

!(async () => {
  const _aliyunTTS = new AliyunTTS(
    {
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeySecret',
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
      nlsUrl: 'https://nls-gateway.cn-shanghai.aliyuncs.com/rest/v1/tts/async',
      apiVersion: '2019-02-28'
    },
    'app key' /** optional **/
  );

  // test aliyun api config
  console.log((await _aliyunTTS.checkConfig()) ? 'passed' : 'error');

  // more ...
})();
```

了解更多 [TTS Define](https://github.com/funnyzak/aliyun-nls/blob/master/lib/tts.d.ts).

### 函数

`AliyunTTS` 有如下方法:

#### `checkConfig(): Promise<boolean>`

返回值 `Promise<boolean>` - 返回阿里云语音配置密钥是否有效。

```js
const checkRlt = await _aliyunTTS.checkConfig();
console.log(checkRlt ? 'the config is passed' : 'error config');
```

#### `task(text: string, options?: AliyunTTS.TTSOption): Promise<string>`

- `text` string - 要转换的文本。
- `options` NLSOption (optional) - 高级设置。

返回值 `Promise<string>` - 返回转换任务 ID。

#### `status(taskId: string, appKey?: string): Promise<AliyunTTS.TTSComplete>`

查询转换状态。

- `taskId` string - 任务 ID。
- `appKey` string (optional) - 应用 Key。

返回值 `Promise<AliyunTTS.TTSComplete>` - 转换状态。

```js
const taskId = await _aliyunTTS.task('你好，世界！', {
  /** options **/
});

console.log(taskId);
```

#### `taskSync(text: string, options: AliyunTTS.TTSOption, interval?: number): Promise<AliyunTTS.TTSComplete>;`

同步返回合成结果。

- `text` string - 要转换的文本。
- `options` NLSOption - 高级设置。
- `interval` number (optional) - 检查转换状态的轮训事件间隔（秒）。

返回值 `Promise<AliyunTTS.TTSComplete>` - 转换状态。

```js
const rlt = await _aliyunTTS.taskSync('你好，世界！', {
  format: 'mp3'
  sample_rate: 16000,
  voice: 'xiaoyun',
  volume: 50,
  speech_rate: 50,
  pitch_rate: 50
  /* options */
});

console.log('complete result => ', JSON.stringify(rlt));
```

### 定义

#### AliyunTTS.TTSOption

- `appKey` - 应用 Key,可选。
- `format` - 音频编码格式，支持 pcm/wav/mp3 格式，默认是 pcm。
- `sample_rate` - 音频采样率，支持 16000Hz 和 8000Hz，默认是 16000Hz。
- `voice` - 发音人，默认是 xiaoyun。更多发音人请参见[接口说明](https://help.aliyun.com/document_detail/130509.htm?spm=a2c4g.11186623.0.0.442a38adeflvK0#topic-2606811)。
- `volume` - 音量，范围是 0~100，默认 50。
- `speech_rate` - 语速，范围是 0-100，默认是 50。
- `pitch_rate` - 语调，范围是 0-100，默认是 50。
- `enable_subtitle` - 是否启用句级时间戳功能，默认值为 false。
- `enable_notify` - 是否启用回调功能，默认值为 false。
- `notify_url` - 回调服务的地址。当 enable_notify 取值为 true 时，本字段必填。URL 支持 HTTP/HTTPS 协议，Host 不能使用 IP 地址。

#### AliyunTTS.TTSComplete

- `task_id` string - 任务 ID。
- `audio_address` string - 合成的音频 URL。
- `notify_custom` string - 回调地址。
- `sentences` json - 句级时间戳对象。
- `appKey`: string - 使用的APP Key。
- `options`: AliyunTTS.TTSOption - 合成选项。
- `text`: string - 待合成文本。
- `startTime`: number - 合成开始时间（毫秒时间戳）。
- `elapsed`: number - 合成耗时（毫秒）。

## Author

| [![twitter/funnyzak](https://s.gravatar.com/avatar/c2437e240644b1317a4a356c6d6253ee?s=70)](https://twitter.com/funnyzak 'Follow @funnyzak on Twitter') |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [funnyzak](https://yycc.me/)                                                                                                                           |

## 参考

- [长文本语音合成文档](https://help.aliyun.com/document_detail/130509.htm?spm=a2c4g.11186623.0.0.442a38adeflvK0#topic-2606811)

## License

Apache-2.0 License © 2021 [funnyzak](https://github.com/funnyzak)
