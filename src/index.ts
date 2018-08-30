import * as Event from "events";
import * as Url from "url";
import * as Cheerio from "cheerio";
import Http from "./http";
import { testExist } from "./util/match";
import { CrawlImp, CrawlConfig, SpiderImp, spiderConfig } from "./types/spider";
import Logger from "./util/logConfig";
const log: Logger.Logger = Logger.getLogger("spider");
class Crawl extends Event implements CrawlImp {
  config: CrawlConfig;
  middleware: { [key: string]: any[] } = {};
  isFirstStart: boolean = true;
  runCount: number = 0;
  isTest: boolean = false;
  hasPlan: boolean = false;
  spiders: { [key: string]: SpiderImp } = {};
  constructor(config: CrawlConfig = {}) {
    super();
    this.config = {
      maxConnect: 0,
      ...config
    };
    this.init();
  }
  private init() {
    this.on("pushTask", this._pushTask);
    this.on("finished", this._finished);
    this.on("parse", this._parse);
    this.on("download", this._download);
    this.on("downloadCompletion", this._downloadCompletion);
    this.on("error", () => {});
    this.on("log", this.spiderLog);
  }
  private spiderLog(spider: any, ...args: Array<any>) {
    if (spider.config.log) {
      log.info("", ...args);
    }
  }
  public registry(name: string, config: spiderConfig) {
    if (!name) throw new Error("You need to specify spider a name");
    if (!config) throw new Error("You need to specify spider a config");
    if (this.spiders[name])
      throw new Error(`Already has a spider named ${name}`);
    if (config["delay"]) {
      //如果设置了延迟，就限制最大为1
      config.maxConnect = 1;
    }
    if (!config.overList) config.overList = new Set();
    this.spiders[name] = {
      config: config,
      runCount: 0,
      parseCount: 0,
      tasklist: new Array(),
      http: new Http(
        {
          http: config.http,
          overList: config.overList,
          norepeat: config.norepeat || true
        },
        config.downloadMiddleware,
        config.errorMiddleware
      )
    };
  }
  public async start(name: string, url: string | Array<string>, plan?: any) {
    if (!this.spiders[name]) throw new Error(`No spider name is ${name}`);
    if (!url || (Array.isArray(url) && !url.length))
      throw new Error(`${name} need to start url or urls`);
    if (this.isFirstStart) {
      this.emit("open", { name });
      this.isFirstStart = false;
    }
    const spider: SpiderImp = this.spiders[name];
    if (plan) {
      plan.timer = null;
      spider.plan = plan;
      this.hasPlan = true;
    }
    const open: Function = spider.config.open;
    open && (await open.call(spider.config, spider.config));
    this.emit("pushTask", { name, url: url });
  }
  public async test(name: string, url: string | Array<string>) {
    this.isTest = true;
    await this.start(name, url);
  }
  private async _download(data: any) {
    let name = data["name"],
      url = data["url"];
    const spider = this.spiders[name];
    this.emit("log", spider, `${name} --download-->${url}`);
    let content = await spider.http.request(url);
    this.emit("downloadCompletion", { name, url });
    if (content instanceof Error) {
      this.emit(
        "log",
        spider,
        `${name} --download Error-->${url} --->${content}`
      );
      this.emit("error", { name, error: content });
      this._callMiddleware(spider.config.errorMiddleware, content);
    } else if (content) {
      this.emit("parse", { name, url, content });
    }
  }
  private async _parse(data: any) {
    let name = data["name"],
      url = data["url"],
      content = data["content"];

    const spider = this.spiders[name],
      rules = spider.config.rules,
      urls: Array<any> = [];
    if (content.length < 1000) {
      this.emit("log", spider, `${name} --html < 1000 byte-->${url}`);
    }
    this.emit("log", spider, `${name} --parse-->${url}`);
    spider.parseCount += 1;
    let parse: Function, pipeline: Function;
    for (let rule of rules) {
      if (spider.plan && !testExist(spider.plan.include, url)) {
        continue;
      }
      const regexp = new RegExp(rule.test, "g");
      if (regexp.test(url)) {
        parse = rule.parse;
        pipeline = rule.pipeline;
      }
      if (
        this.isTest ||
        (spider.plan && !testExist(spider.plan.findlist, url))
      ) {
        continue;
      }
      let matchUrls = content.match(regexp);
      Array.isArray(matchUrls) &&
        matchUrls.forEach(u => {
          let parentUrl = url;
          if (rule.baseUrl) {
            parentUrl = rule.baseUrl;
          }
          u = Url.resolve(parentUrl, u);
          if (!urls.includes(u)) {
            urls.push(u);
          }
        });
    }
    this.emit("pushTask", { name, url: urls });
    let item;
    try {
      if (parse) {
        item = await parse.call(
          spider.config,
          url,
          content,
          Cheerio.load(content),
          spider.config
        );
        pipeline &&
          item &&
          (await pipeline.call(spider.config, item, spider.config));
      }
    } catch (e) {
      log.error(e);
      this._callMiddleware(spider.config.errorMiddleware, e);
      this.emit("error", { name, error: e });
    }
    spider.parseCount -= 1;
    this.emit("finished", { name, url, item });
    this.emit("log", spider, `${name} --finished-->${url}`);
  }
  private async _finished(data: any) {
    let name = data["name"];
    const spider = this.spiders[name];
    if (
      spider.runCount === 0 &&
      !spider.tasklist.length &&
      spider.parseCount === 0
    ) {
      if (spider.plan) {
        if (spider.plan.timer) {
          clearTimeout(spider.plan.timer);
        }
        spider.plan.timer = setTimeout(() => {
          this.emit("plan", { name });
          const urls = Array.isArray(spider.plan.url)
            ? spider.plan.url
            : [spider.plan.url];
          urls.forEach(url => {
            spider.config.overList.delete(url);
          });
          this.emit("pushTask", { name, url: spider.plan.url });
        }, spider.plan.interval);
        return;
      }
      const close: Function = spider.config.close;
      if (close && typeof close === "function") {
        await spider.config.close.call(spider.config, spider.config);
      }
      if (this.runCount === 0 && !this.hasPlan) {
        for (let key in this.spiders) {
          if (this.spiders[key].tasklist.length) {
            return;
          }
        }
        this.emit("close", { crawl: this });
      }
    }
  }
  private _downloadCompletion(data: any) {
    let name = data["name"];
    const spider = this.spiders[name];
    spider.runCount -= 1;
    this.runCount -= 1;
    if (this._checkSpider(name) && spider.tasklist.length) {
      let url = spider.tasklist.pop();
      if (url) {
        this.emit("pushTask", { name, url });
      }
    }
  }
  private _request(data: any) {
    let name = data["name"],
      url = data["url"];
    this.emit("request", { name, url });
    const spider = this.spiders[name];
    spider.runCount += 1;
    this.runCount += 1;
    let delay = spider.config.delay || 0;
    setTimeout(() => {
      this.emit("download", { name, url });
    }, delay);
  }
  private _pushTask(data: any) {
    let name = data["name"],
      url = data["url"];
    let urls: Array<string> = Array.isArray(url) ? url : [url];
    urls.forEach(u => {
      if (!u) return;
      if (this._checkSpider(name)) {
        this._request({ name, url: u });
      } else {
        this.spiders[name].tasklist.push(u);
      }
    });
  }
  private _checkSpider(name: string): Boolean {
    //如果最大限制存在，并且现在运行超过最大限制
    if (this.config.maxConnect && this.runCount >= this.config.maxConnect) {
      return false;
    }
    const spider = this.spiders[name];
    const config = spider.config;
    if (config.maxConnect && spider.runCount >= config.maxConnect) {
      return false;
    }
    return true;
  }
  private _callMiddleware(name: any, ...args: any[]) {
    let middleware = Array.isArray(name) ? name : this.middleware[name];
    if (!middleware) return;
    for (let cb of middleware) {
      cb(...args);
    }
  }
}
export default Crawl;
