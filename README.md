[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![npm](https://img.shields.io/npm/v/@funnyzak/aliyun-nls.svg?style=flat-square)](https://www.npmjs.com/package/@funnyzak/aliyun-nls)
[![license](https://img.shields.io/github/license/funnyzak/static-http-server.svg?style=flat-square)](https://github.com/funnyzak/static-http-server)

# AliYun Cloud NLS

AliCloud Speech Synthesis NodeJs WebApi wrapper.

## Getting Started

1. With [npm](http://npmjs.org), run `npm install @funnyzak/aliyun-nls`
2. `const { AliYunNls } = require('@funnyzak/aliyun-nls')`

## Usage

Here is an example that:

1. create a new Nls Client
2. run task.

```js
const { AliyunNls } = require('@funnyzak/aliyun-nls')

!(async () => {
const _aliyunNls = new AliyunNls(
  'this is app key',
  {
    accessKeyId: 'this is accessKeyId',
    accessKeySecret: 'this is accessKeySecret',
    endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
    apiVersion: '2019-02-28'
  },
  true
);


// test aliyun api key
console.log(await _aliyunNls.checkConfig() ? 'passed' : 'error');

// get token
console.log(await _aliyunNls.getToken() );

// start a nls task
_aliyunNls.task('你好', {
  format: 'mp3'
}).then(rlt => {
  console.log(rlt)
})

// more ...

})();

```

read more [nls define](lib/nls.d.ts).



## Author

| [![twitter/funnyzak](https://s.gravatar.com/avatar/c2437e240644b1317a4a356c6d6253ee?s=70)](https://twitter.com/funnyzak 'Follow @funnyzak on Twitter') |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [funnyzak](https://yycc.me/)                                                                                                                           |

## License

Apache-2.0 License © 2021 [funnyzak](https://github.com/funnyzak)
