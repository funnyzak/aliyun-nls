'use strict';

const expect = require('expect.js');
const AliyunNLS = require('../lib/nls');

describe('AliyunNLS Core', function () {
  describe('AliyunNLS', function () {
    it('should pass into "config.accessKeyId"', function () {
      expect(function () {
        new AliyunNLS({
          endpoint: 'http://ecs.aliyuncs.com/',
          apiVersion: '1.0'
        });
      }).to.throwException(/must pass "config\.accessKeyId"/);
    });

    it('should pass into "config.accessKeySecret"', function () {
      expect(function () {
        new AliyunNLS({
          endpoint: 'http://ecs.aliyuncs.com/',
          apiVersion: '1.0',
          accessKeyId: 'accessKeyId'
        });
      }).to.throwException(/must pass "config\.accessKeySecret"/);
    });

    it('should pass into "config.nlsUrl"', function () {
      expect(function () {
        new AliyunNLS({
          endpoint: 'http://ecs.aliyuncs.com/',
          apiVersion: '1.0',
          accessKeyId: 'accessKeyId',
          accessKeySecret: 'accessKeySecret'
        });
      }).to.throwException(/must pass "config\.nlsUrl"/);
    });

    it('should ok with http endpoint', function () {
      const nls = new AliyunNLS({
        endpoint: 'http://ecs.aliyuncs.com',
        apiVersion: '1.0',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        nlsUrl: 'https://nls-gateway.cn-shanghai.aliyuncs.com/rest/v1/tts/async'
      });
      expect(nls.config.endpoint).to.be('http://ecs.aliyuncs.com');
      expect(nls.client.keepAliveAgent.protocol).to.be('http:');
    });

    it('should ok with https endpoint', function () {
      const nls = new AliyunNLS({
        endpoint: 'https://ecs.aliyuncs.com/',
        apiVersion: '1.0',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        nlsUrl: 'https://nls-gateway.cn-shanghai.aliyuncs.com/rest/v1/tts/async'
      });
      expect(nls.client.endpoint).to.be('https://ecs.aliyuncs.com');
      expect(nls.client.keepAliveAgent.protocol).to.be('https:');
    });

    it('should ok with codes', function () {
      const nls = new AliyunNLS({
        endpoint: 'https://ecs.aliyuncs.com/',
        apiVersion: '1.0',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        codes: ['True'],
        nlsUrl: 'https://nls-gateway.cn-shanghai.aliyuncs.com/rest/v1/tts/async'
      });
      expect(nls.client.codes.has('True')).to.be.ok();
    });
  });
});
