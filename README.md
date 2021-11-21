# AliYun Cloud NLS

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

阿里云长语音合成 Node 模块。

## 开始

from [npm](https://github.com/npm/npm)

    $ npm install @funnyzak/aliyun-nls

## 用例

```js
const { AliyunNLS } = require('@funnyzak/aliyun-nls');

!(async () => {
  const _aliyunNls = new AliyunNLS(
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
  console.log((await _aliyunNls.checkConfig()) ? 'passed' : 'error');

  // more ...
})();
```

了解更多 [nls define](lib/nls.d.ts).

## 函数

`AliyunNls` 有如下方法:

### `checkConfig(): Promise<boolean>`

返回值 `Promise<boolean>` - 返回阿里云语音配置密钥是否有效。

```js
const checkRlt = await _aliyunNls.checkConfig();
console.log(checkRlt ? 'the config is passed' : 'error config');
```

### `task(text: string, options?: NLSOption): Promise<string>`

- `text` string - 要转换的文本。
- `options` NLSOption (optional) - 高级设置。

返回值 `Promise<string>` - 返回转换任务 ID。

### `status(taskId: string, appKey?: string): Promise<NLSComplete>`

查询转换状态。

- `taskId` string - 任务 ID。
- `appKey` string (optional) - 应用 Key。

返回值 `Promise<NLSComplete>` - 转换状态。

```js
const taskId = await _aliyunNls.task('你好，世界！', {
  /** options **/
});
console.log(taskId);
```

### `taskSync(text: string, options: NLSOption, interval?: number): Promise<NLSComplete>;`

同步返回合成结果。

- `text` string - 要转换的文本。
- `options` NLSOption - 高级设置。
- `interval` number (optional) - 检查转换状态的轮训事件间隔（秒）。

返回值 `Promise<NLSComplete>` - 转换状态。

```js
const rlt = await _aliyunNls.taskSync('你好，世界！', {
  format: 'mp3'
  sample_rate: 16000,
  voice: 'xiaoyun',
  volume: 50,
  speech_rate: 50,
  pitch_rate: 50
  /* options */
});

console.log('audio url => ', rlt.audio_address);
```

## 定义

### NLSOption

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

### NLSComplete

- `task_id` string - 任务 ID
- `audio_address` string - 合成的音频 URL
- `notify_custom` string - 回调地址
- `sentences` json - 句级时间戳对象

## Author

| [![twitter/funnyzak](https://s.gravatar.com/avatar/c2437e240644b1317a4a356c6d6253ee?s=70)](https://twitter.com/funnyzak 'Follow @funnyzak on Twitter') |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [funnyzak](https://yycc.me/)                                                                                                                           |

## 参考

- [长文本语音合成文档](https://help.aliyun.com/document_detail/130509.htm?spm=a2c4g.11186623.0.0.442a38adeflvK0#topic-2606811)

## License

Apache-2.0 License © 2021 [funnyzak](https://github.com/funnyzak)
