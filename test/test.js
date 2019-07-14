const assert = require("assert");
const koa = require("koa");
const koaStatic = require("koa-static");
const spider = require("../dist/index.js").default;
const http = require("http");
let server;
describe("spider", function() {
  before(function(done) {
    const app = new koa();
    app.use(async (ctx, next) => {
      const url = ctx.URL;
      if (url.pathname === "/post" && ctx.method === "POST") {
        ctx.body = {
          str: "hello-post"
        };
      } else {
        await next();
      }
    });
    app.use(koaStatic("./test/html"));
    server = http.createServer(app.callback());
    server.listen(8881, () => {
      done();
    });
  });
  after(() => {
    server.close();
  });
  it("网络请求,cheerio的数据处理,parse处理功能", function(done) {
    this.timeout(1000);
    const s = new spider({
      name: "name",
      log: false,
      rules: [
        {
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/,
          async parse(url, data, $, config, spider) {
            const a2Text = $("a:nth-child(2)").text();
            return a2Text;
          },
          async pipeline(item) {
            assert.equal(item, "b");
            done();
          },
          error(url, error) {
            done(error);
          }
        }
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        }
      ]
    });
    s.test("http://127.0.0.1:8881/links.html");
  });
  it("根据规则自动匹配的能力", function(done) {
    this.timeout(1000);
    const s = new spider({
      name: "name",
      log: false,
      rules: [
        {
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/
        },
        {
          test: /\/spider-a\.html/,
          async parse(url, data, $, config, spider) {
            assert.equal(
              $(".spider")
                .text()
                .split("-")[1]
                .trim(),
              "a"
            );
            done();
          },
          error(url, error) {
            done(error);
          }
        }
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        }
      ]
    });
    s.start("http://127.0.0.1:8881/links.html");
  });
  it("主动发起网络请求,并携带meta功能,取消自动匹配url", function(done) {
    this.timeout(1000);
    const s = new spider({
      name: "name",
      log: false,
      rules: [
        {
          config: {
            include: false
          },
          test: /http:\/\/127\.0\.0\.1:8881\/links\.html/,
          async parse(url, data, $, config, spider) {
            spider.push("http://127.0.0.1:8881/spider-b.html", {
              meta: {
                str: "hello-b"
              }
            });
          }
        },
        {
          test: /\/spider-\S\.html/,
          async parse(url, data, $, config, spider) {
            assert.equal(
              $(".spider")
                .text()
                .split("-")[1]
                .trim(),
              "b"
            );
            assert.equal(config.meta.str, "hello-b");
            done();
          },
          error(url, error) {
            done(error);
          }
        }
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        }
      ]
    });
    s.start("http://127.0.0.1:8881/links.html");
  });
  it("使用open发送post请求", function(done) {
    this.timeout(1000);
    const s = new spider({
      name: "name",
      log: false,
      async open(spider) {
        spider.push("http://127.0.0.1:8881/post", {
          method: "POST"
        });
      },
      rules: [
        {
          test: /\/post/,
          async parse(url, data, $, config, spider) {
            const obj = data;
            assert.equal(obj.str, "hello-post");
            done();
          },
          error(url, error) {
            done(error);
          }
        }
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        }
      ]
    });
    s.start();
  });
  it("中文编码解析", function(done) {
    this.timeout(1000);
    const s = new spider({
      name: "name",
      log: false,
      rules: [
        {
          test: /\/cn.html/,
          config: {
            charset: "gbk"
          },
          async parse(url, data, $, config, spider) {
            const obj = $(".text")
              .text()
              .trim();
            assert.equal(obj, "你好,世界");
            done();
          },
          error(url, error) {
            done(error);
          }
        }
      ],
      errorMiddleware: [
        async (url, error) => {
          done(error);
        }
      ]
    });
    s.start("http://127.0.0.1:8881/cn.html");
  });
});
