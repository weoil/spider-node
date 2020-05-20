const assert = require('assert');
const koa = require('koa');
const koaStatic = require('koa-static');
const {
  createLogger,
  default: spider,
  Deduplication,
} = require('../dist/index.js');
const http = require('http');
let server;
let testLogger = createLogger('test');
describe('spider', function() {
  before(function(done) {
    const app = new koa();
    app.use(async (ctx, next) => {
      const url = ctx.URL;
      if (url.pathname === '/post' && ctx.method === 'POST') {
        ctx.append('hello', 'world');
        ctx.body = {
          str: 'hello-post',
        };
      } else {
        await next();
      }
    });
    app.use(koaStatic('./test/html'));
    server = http.createServer(app.callback());
    server.listen(8881, () => {
      done();
    });
  });
  after(() => {
    server.close();
  });
  it('检测response功能返回', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /\/post/,
          async parse(url, data, $, config, spider) {
            assert(config.response.headers.hello, 'world');
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],
    });
    s.push('http://127.0.0.1:8881/post', {
      method: 'POST',
    });
  });
  it('网络请求,cheerio的数据处理,parse处理功能', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/,
          async parse(url, data, $, config, spider) {
            const a2Text = $('a:nth-child(2)').text();
            return a2Text;
          },
          async pipeline(item) {
            assert.equal(item, 'b');
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],
    });
    s.test('http://127.0.0.1:8881/links.html');
  });
  it('根据规则自动匹配的能力', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/,
        },
        {
          test: /\/spider-a\.html/,
          async parse(url, data, $, config, spider) {
            assert.equal(
              $('.spider')
                .text()
                .split('-')[1]
                .trim(),
              'a'
            );
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],
    });
    s.start('http://127.0.0.1:8881/links.html');
  });
  it('主动发起网络请求,并携带meta功能,取消自动匹配url', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          config: {
            include: false,
          },
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/,
          async parse(url, data, $, config, spider) {
            spider.push('http://127.0.0.1:8881/spider-b.html', {
              meta: {
                str: 'hello-b',
              },
            });
          },
        },
        {
          test: /\/spider-\S\.html/,
          async parse(url, data, $, config, spider) {
            assert.equal(
              $('.spider')
                .text()
                .split('-')[1]
                .trim(),
              'b'
            );
            assert.equal(config.meta.str, 'hello-b');
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],

      close() {
        // console.log('close');
      },
    });
    s.start('http://127.0.0.1:8881/links.html');
  });
  it('使用open发送post请求', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      async open(spider) {
        spider.push('http://127.0.0.1:8881/post', {
          method: 'POST',
        });
      },
      rules: [
        {
          test: /\/post/,
          async parse(url, data, $, config, spider) {
            const obj = data;
            assert.equal(obj.str, 'hello-post');
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],
    });
    s.start();
  });
  it('中文编码解析', function(done) {
    this.timeout(1000);
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /\/cn.html/,
          config: {
            charset: 'gbk',
          },
          async parse(url, data, $, config, spider) {
            const obj = $('.text')
              .text()
              .trim();
            assert.equal(obj, '你好,世界');
            done();
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        },
      ],
    });
    s.start('http://127.0.0.1:8881/cn.html');
  });
  it('定时任务', function(done) {
    this.timeout(4000);
    let count = 0;
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /\/cn.html/,
          config: {
            charset: 'gbk',
          },
          async parse(url, data, $, config, spider) {
            count++;
            if (count === 4) {
              throw new Error('fuck');
            }
          },
          pipeline() {
            return new Promise((r) => {
              setTimeout(() => {
                r();
              }, 100);
            });
          },
          error(url, error) {
            done(error);
          },
        },
      ],
      downloadMiddleware: [
        (c) => {
          // console.log(count);
          if (count >= 3) {
            count++;
            return false;
          }
          return c;
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          if (count === 4) {
            s.cancel();
            done();
            return;
          }
          done(error);
        },
      ],
    });
    s.plan('*/1 * * * * *', () => 'http://127.0.0.1:8881/cn.html', true);
  });
  it('指定rule延迟', function(done) {
    this.timeout(3000);
    let taskCount = 0;
    let startDate = Date.now();
    const s = new spider({
      name: 'name',
      log: false,
      http: {
        timeout: 1000,
        maxConnect: 1,
      },
      rules: [
        {
          test: /\/spider-\S\.html/,
          config: {
            include: false,
            delay: 1000,
            http: {
              repeat: true,
            },
          },
          async parse(url, data, $, config, spider) {
            if (taskCount === 1) {
              assert.equal(
                $('.spider')
                  .text()
                  .split('-')[1]
                  .trim(),
                'a'
              );
              if (Date.now() - startDate >= 1000) {
                done();
              }
            }
            taskCount++;
          },
          error(url, error) {
            s.cancel();
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          s.cancel();
          done(error);
        },
      ],
    });
    s.start([
      'http://127.0.0.1:8881/spider-a.html',
      'http://127.0.0.1:8881/spider-a.html',
    ]);
  });
  it('测试去重', function(done) {
    let count = 0;
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /a\.html/,
          async parse(url, data, $, config, spider) {
            if (count >= 1) {
              done('repeat!');
              s.close();
            }
            count++;
          },
        },
      ],
      close() {
        done();
      },
      downloadMiddleware: [Deduplication()],
    });
    s.start(() => [
      'http://127.0.0.1:8881/spider-a.html',
      'http://127.0.0.1:8881/spider-a.html',
    ]);
  });
  it('测试去重-超时', function(done) {
    let time = null;
    const s = new spider({
      name: 'name',
      log: false,
      rules: [
        {
          test: /a\.html/,
          async parse(url, data, $, config, spider) {
            if (!time) {
              time = Date.now();
              return;
            } else if (Date.now() - time >= 1000) {
              done();
            } else {
              done('repeat!!');
            }
            throw 1;
          },
          error() {
            s.cancel();
          },
        },
      ],
      downloadMiddleware: [Deduplication()],
    });
    s.plan(
      '*/1 * * * * *',
      () => {
        [1, 1].forEach(() => {
          s.push('http://127.0.0.1:8881/spider-a.html', {
            meta: {
              ttl: 1,
            },
          });
        });
      },
      true
    );
  });

  it('测试字符串转正则', function(done) {
    this.timeout(3000);
    let taskCount = 0;
    let startDate = Date.now();
    const s = new spider({
      name: 'name',
      log: false,
      http: {
        timeout: 1000,
        maxConnect: 1,
      },
      rules: [
        {
          test: '/spider-\\S.html',
          config: {
            include: false,
          },
          async parse(url, data, $, config, spider) {
            done();
          },
          error(url, error) {
            s.cancel();
            done(error);
          },
        },
      ],
      errorMiddleware: [
        async (url, error) => {
          s.cancel();
          done(error);
        },
      ],
    });
    s.start(['http://127.0.0.1:8881/spider-a.html']);
  });
});
