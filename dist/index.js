module.exports = (function(e) {
  var t = {};
  function i(r) {
    if (t[r]) return t[r].exports;
    var n = (t[r] = { i: r, l: !1, exports: {} });
    return e[r].call(n.exports, n, n.exports, i), (n.l = !0), n.exports;
  }
  return (
    (i.m = e),
    (i.c = t),
    (i.d = function(e, t, r) {
      i.o(e, t) ||
        Object.defineProperty(e, t, {
          configurable: !1,
          enumerable: !0,
          get: r
        });
    }),
    (i.r = function(e) {
      Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (i.n = function(e) {
      var t =
        e && e.__esModule
          ? function() {
              return e.default;
            }
          : function() {
              return e;
            };
      return i.d(t, "a", t), t;
    }),
    (i.o = function(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (i.p = ""),
    (i.w = {}),
    i((i.s = 9))
  );
})([
  function(e, t, i) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = i(2);
    r.configure({
      appenders: { spider: { type: "console" } },
      categories: {
        spider: { appenders: ["spider"], level: "info" },
        default: { appenders: ["spider"], level: "info" }
      }
    }),
      (t.default = r);
  },
  function(e, t, i) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 }),
      (t.testExist = function(e, t) {
        let i = Array.isArray(e) ? e : [e];
        for (let e of i) if (e.test(t)) return !0;
        return !1;
      });
  },
  function(e, t) {
    e.exports = require("log4js");
  },
  function(e, t) {
    e.exports = require("iconv-lite");
  },
  function(e, t) {
    e.exports = require("request-promise");
  },
  function(e, t, i) {
    "use strict";
    var r =
      (this && this.__awaiter) ||
      function(e, t, i, r) {
        return new (i || (i = Promise))(function(n, s) {
          function o(e) {
            try {
              l(r.next(e));
            } catch (e) {
              s(e);
            }
          }
          function a(e) {
            try {
              l(r.throw(e));
            } catch (e) {
              s(e);
            }
          }
          function l(e) {
            e.done
              ? n(e.value)
              : new i(function(t) {
                  t(e.value);
                }).then(o, a);
          }
          l((r = r.apply(e, t || [])).next());
        });
      };
    Object.defineProperty(t, "__esModule", { value: !0 });
    const n = i(4),
      s = i(3);
    i(0).default.getLogger("spider");
    function o(e, t) {
      return r(this, void 0, void 0, function*() {
        if (t.norepeat) {
          let i = !t.overList.has(e);
          return t.overList.add(e), i;
        }
      });
    }
    t.default = class {
      constructor(e, t, i) {
        (this.config = e),
          (this.middleware = [...t, o]),
          (this.errorMiddleware = i);
      }
      callMiddleware(e, t, ...i) {
        return r(this, void 0, void 0, function*() {
          if (!t) return !0;
          for (const r of t) if (!1 === (yield r(e, ...i))) return !1;
        });
      }
      request(e) {
        return r(this, void 0, void 0, function*() {
          try {
            if (
              !1 ===
              (yield this.callMiddleware(e, this.middleware, this.config))
            )
              return;
            let t = yield n.get(
              e,
              Object.assign({}, this.config.http, { encoding: null, jar: !1 })
            );
            return this.decode(t, this.config.charset);
          } catch (e) {
            return e;
          }
        });
      }
      decode(e, t) {
        if (t) return s.decode(e, t);
        let i = s.decode(e, "utf8");
        try {
          t = (t = /charset\=[^"].*"|charset\="[^"].*"/.exec(i)[0])
            .replace("charset=", "")
            .replace(/"/g, "")
            .replace("-", "")
            .trim();
        } catch (e) {
          t = "utf8";
        }
        return "utf8" === t.toLowerCase() ? i : s.decode(e, t);
      }
    };
  },
  function(e, t) {
    e.exports = require("cheerio");
  },
  function(e, t) {
    e.exports = require("url");
  },
  function(e, t) {
    e.exports = require("events");
  },
  function(e, t, i) {
    "use strict";
    var r =
      (this && this.__awaiter) ||
      function(e, t, i, r) {
        return new (i || (i = Promise))(function(n, s) {
          function o(e) {
            try {
              l(r.next(e));
            } catch (e) {
              s(e);
            }
          }
          function a(e) {
            try {
              l(r.throw(e));
            } catch (e) {
              s(e);
            }
          }
          function l(e) {
            e.done
              ? n(e.value)
              : new i(function(t) {
                  t(e.value);
                }).then(o, a);
          }
          l((r = r.apply(e, t || [])).next());
        });
      };
    Object.defineProperty(t, "__esModule", { value: !0 });
    const n = i(8),
      s = i(7),
      o = i(6),
      a = i(5),
      l = i(1),
      u = i(0).default.getLogger("spider");
    t.default = class extends n {
      constructor(e = {}) {
        super(),
          (this.middleware = {}),
          (this.isFirstStart = !0),
          (this.runCount = 0),
          (this.isTest = !1),
          (this.hasPlan = !1),
          (this.spiders = {}),
          (this.config = Object.assign({ maxConnect: 0 }, e)),
          this.init();
      }
      init() {
        this.on("pushTask", this._pushTask),
          this.on("finished", this._finished),
          this.on("parse", this._parse),
          this.on("download", this._download),
          this.on("downloadCompletion", this._downloadCompletion),
          this.on("error", () => {}),
          this.on("log", this.spiderLog);
      }
      spiderLog(e, ...t) {
        e.config.log && u.info("", ...t);
      }
      registry(e, t) {
        if (!e) throw new Error("You need to specify spider a name");
        if (!t) throw new Error("You need to specify spider a config");
        if (this.spiders[e]) throw new Error(`Already has a spider named ${e}`);
        t.delay && (t.maxConnect = 1),
          t.overList || (t.overList = new Set()),
          (this.spiders[e] = {
            config: t,
            runCount: 0,
            parseCount: 0,
            tasklist: new Array(),
            http: new a.default(
              {
                http: t.http,
                overList: t.overList,
                norepeat: t.norepeat || !0
              },
              t.downloadMiddleware,
              t.errorMiddleware
            )
          });
      }
      start(e, t, i) {
        return r(this, void 0, void 0, function*() {
          if (!this.spiders[e]) throw new Error(`No spider name is ${e}`);
          if (!t || (Array.isArray(t) && !t.length))
            throw new Error(`${e} need to start url or urls`);
          this.isFirstStart &&
            (this.emit("open", { name: e }), (this.isFirstStart = !1));
          const r = this.spiders[e];
          i && ((i.timer = null), (r.plan = i), (this.hasPlan = !0));
          const n = r.config.open;
          n && (yield n.call(r.config, r.config)),
            this.emit("pushTask", { name: e, url: t });
        });
      }
      test(e, t) {
        return r(this, void 0, void 0, function*() {
          (this.isTest = !0), yield this.start(e, t);
        });
      }
      _download(e) {
        return r(this, void 0, void 0, function*() {
          let t = e.name,
            i = e.url;
          const r = this.spiders[t];
          this.emit("log", r, `${t} --download--\x3e${i}`);
          let n = yield r.http.request(i);
          this.emit("downloadCompletion", { name: t, url: i }),
            n instanceof Error
              ? (this.emit(
                  "log",
                  r,
                  `${t} --download Error--\x3e${i} ---\x3e${n}`
                ),
                this.emit("error", { name: t, error: n }),
                this._callMiddleware(r.config.errorMiddleware, n))
              : n && this.emit("parse", { name: t, url: i, content: n });
        });
      }
      _parse(e) {
        return r(this, void 0, void 0, function*() {
          let t = e.name,
            i = e.url,
            r = e.content;
          const n = this.spiders[t],
            a = n.config.rules,
            c = [];
          let d, h, f;
          r.length < 1e3 &&
            this.emit("log", n, `${t} --html < 1000 byte--\x3e${i}`),
            this.emit("log", n, `${t} --parse--\x3e${i}`),
            (n.parseCount += 1);
          for (let e of a) {
            if (n.plan && !l.testExist(n.plan.include, i)) continue;
            const t = new RegExp(e.test, "g");
            if (
              (t.test(i) && ((d = e.parse), (h = e.pipeline)),
              this.isTest || (n.plan && !l.testExist(n.plan.findlist, i)))
            )
              continue;
            let o = r.match(t);
            Array.isArray(o) &&
              o.forEach(t => {
                let r = i;
                e.baseUrl && (r = e.baseUrl),
                  (t = s.resolve(r, t)),
                  c.includes(t) || c.push(t);
              });
          }
          this.emit("pushTask", { name: t, url: c });
          try {
            d &&
              ((f = yield d.call(n.config, i, r, o.load(r), n.config)),
              h && f && (yield h.call(n.config, f, n.config)));
          } catch (e) {
            u.error(e),
              this._callMiddleware(n.config.errorMiddleware, e),
              this.emit("error", { name: t, error: e });
          }
          (n.parseCount -= 1),
            this.emit("finished", { name: t, url: i, item: f }),
            this.emit("log", n, `${t} --finished--\x3e${i}`);
        });
      }
      _finished(e) {
        return r(this, void 0, void 0, function*() {
          let t = e.name;
          const i = this.spiders[t];
          if (0 === i.runCount && !i.tasklist.length && 0 === i.parseCount) {
            if (i.plan)
              return (
                i.plan.timer && clearTimeout(i.plan.timer),
                void (i.plan.timer = setTimeout(() => {
                  this.emit("plan", { name: t }),
                    (Array.isArray(i.plan.url)
                      ? i.plan.url
                      : [i.plan.url]
                    ).forEach(e => {
                      i.config.overList.delete(e);
                    }),
                    this.emit("pushTask", { name: t, url: i.plan.url });
                }, i.plan.interval))
              );
            const e = i.config.close;
            if (
              (e &&
                "function" == typeof e &&
                (yield i.config.close.call(i.config, i.config)),
              0 === this.runCount && !this.hasPlan)
            ) {
              for (let e in this.spiders)
                if (this.spiders[e].tasklist.length) return;
              this.emit("close", { crawl: this });
            }
          }
        });
      }
      _downloadCompletion(e) {
        let t = e.name;
        const i = this.spiders[t];
        if (
          ((i.runCount -= 1),
          (this.runCount -= 1),
          this._checkSpider(t) && i.tasklist.length)
        ) {
          let e = i.tasklist.pop();
          e && this.emit("pushTask", { name: t, url: e });
        }
      }
      _request(e) {
        let t = e.name,
          i = e.url;
        this.emit("request", { name: t, url: i });
        const r = this.spiders[t];
        (r.runCount += 1), (this.runCount += 1);
        let n = r.config.delay || 0;
        setTimeout(() => {
          this.emit("download", { name: t, url: i });
        }, n);
      }
      _pushTask(e) {
        let t = e.name,
          i = e.url;
        (Array.isArray(i) ? i : [i]).forEach(e => {
          e &&
            (this._checkSpider(t)
              ? this._request({ name: t, url: e })
              : this.spiders[t].tasklist.push(e));
        });
      }
      _checkSpider(e) {
        if (this.config.maxConnect && this.runCount >= this.config.maxConnect)
          return !1;
        const t = this.spiders[e],
          i = t.config;
        return !(i.maxConnect && t.runCount >= i.maxConnect);
      }
      _callMiddleware(e, ...t) {
        let i = Array.isArray(e) ? e : this.middleware[e];
        if (i) for (let e of i) e(...t);
      }
    };
  }
]);
