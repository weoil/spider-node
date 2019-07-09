import { EventEmitter } from "events";
import { Logger } from "log4js";
import Schedule from "node-schedule";
import { Http as NHttp } from "../types/http.d";
import { Rule as NRule } from "../types/rule.d";
import { Spider as NSpider } from "../types/spider";
import Http from "./http";
import Rule from "./rule";
import { createLogger } from "./utils/logger";

enum Mode {
  development,
  production,
  test
}
enum Status {
  Running,
  Complete,
  Waiting
}
type startUrl = string | string[] | NSpider.urlsFn | Set<string>;
class Spider extends EventEmitter implements NSpider.ISpider {
  public static new(config: NSpider.Config) {
    return new Spider(config);
  }
  public config: NSpider.Config = {};
  public logger: Logger;
  public rules: Rule[] = [];
  public http: Http;
  public status: Status = Status.Waiting;
  public mode: Mode = Mode.production;
  public errorMiddlewares: NSpider.ErrorMiddleware[] = [];
  constructor(config: NSpider.Config, http?: Http) {
    super();
    this.config = { ...this.config, ...config };
    if (http) {
      this.http = Http.clone(http);
    } else {
      this.http = new Http(
        { ...config.http, name: config.name, log: config.log },
        config.downloadMiddleware
      );
    }
    this.logger = createLogger(config.name || "spider", config.log);
    this.init(this.config);
  }
  public init(config: NSpider.Config) {
    if (config.rules) {
      this.initRules(config.rules);
    }
    if (config.errorMiddleware) {
      this.errorMiddlewares = this.errorMiddlewares.concat(
        config.errorMiddleware
      );
    }
    this.http.on("complete", this.handler.bind(this));
    this.http.on("error", this.error.bind(this));
    this.http.on("completeAll", this.onCompleteAll.bind(this));
  }
  public async start(urls: startUrl = [], config?: NHttp.Config) {
    this.status = Status.Running;
    if (this.config.open && typeof this.config.open === "function") {
      this.logger.info(`执行打开函数`);
      await this.config.open.call(this, this);
    }
    this.push(urls, config);
  }
  public test(urls: startUrl, config?: NHttp.Config) {
    this.mode = Mode.test;
    this.start(urls, config);
  }
  public push(
    urls: startUrl,
    config: NHttp.Config = {},
    priority: boolean = false
  ) {
    let arr: string[] = [];
    if (typeof urls === "function") {
      urls = urls();
    }
    if (Array.isArray(urls)) {
      arr = arr.concat(urls);
    } else if (urls instanceof Set) {
      arr = arr.concat(Array.from(urls));
    } else {
      arr.push(urls);
    }
    if (this.http.connect === 0 && arr.length === 0) {
      this.status = Status.Complete;
      return;
    }
    arr.forEach((url: string) => {
      if (!url || typeof url !== "string") {
        return;
      }
      this.logger.info(`任务推送:${url}`);
      const ruleConfig = this.getRuleConfig(url);
      const ruleHttp = (ruleConfig && ruleConfig.http) || {};
      this.http.push(
        url,
        { ...ruleHttp, rule: ruleConfig, ...config },
        priority
      );
    });
  }
  public rule(
    name: string,
    test: string | RegExp,
    parse: NRule.IParse,
    ...args: any[]
  ): Promise<any> {
    let config: NRule.Config = {};
    const c = args[args.length - 1];
    if (typeof c === "object") {
      config = c;
      args.pop();
    }
    let rej: any;
    const p = new Promise((_, reject) => {
      rej = reject;
    });
    const rule = new Rule(
      name,
      test,
      config,
      parse,
      args,
      (url: string, err: Error, cfg: NRule.Config) => {
        rej(url, err, cfg, this);
      }
    );
    this.rules.push(rule);
    return p;
  }
  public use(...args: NHttp.DownloadMiddleware[]): void {
    this.http.appendMiddleware(args);
  }
  public async handler(params: {
    url: string;
    data: string | object;
    config: NHttp.Config;
  }): Promise<any> {
    const { url, data, config } = params;
    this.logger.info(`请求完成,等待处理,${url}`);
    const rules = this.rules.filter((rule) => {
      return rule.test(url);
    });
    // 是否从该文档提取url
    let include = true;
    rules.forEach(async (r: Rule) => {
      try {
        if (include) {
          include = r.isInclude();
        }
        this.logger.info(`正在进行数据处理:${url}`);
        await r.call(url, data, config, this);
      } catch (error) {
        this.logger.error(`数据处理异常,url:${url},error:`, error);
        r.callError(url, error, config, this);
      }
    });
    if (!include || typeof data !== "string" || this.mode === Mode.test) {
      return;
    }
    this.logger.info(`正在提取匹配url:${url}`);
    const urls = this.rules.reduce((set: Set<string>, rule: Rule) => {
      const cs = rule.match(url, data);
      cs.forEach((u: string) => {
        set.add(u);
      });
      return set;
    }, new Set<string>());
    this.push(urls);
  }
  public error(params: { url: string; error: Error; config: NHttp.Config }) {
    const { url, error, config } = params;
    this.errorMiddlewares.forEach((fn: NSpider.ErrorMiddleware) => {
      fn.call(this, url, error, config, this);
    });
  }
  // corntab 语法定时任务 -> 秒 分 时 日 月 周几
  public plan(cron: string, urls: startUrl, immediate: boolean = true): void {
    if (immediate) {
      this.start(urls);
    }
    Schedule.scheduleJob(cron, () => {
      if (this.status === Status.Running) {
        return;
      }
      this.start(urls);
    });
  }
  public onCompleteAll() {
    this.status = Status.Complete;
    this.logger.info(`任务全部完成`);
    if (this.config.plan) {
      const { time, urls } = this.config.plan;
      this.logger.info(`等待执行计划任务,剩余时间${time}`);
      setTimeout(() => {
        this.logger.info(`执行定时任务`);
        this.push(urls);
      }, time);
    } else if (this.config.close && typeof this.config.close === "function") {
      this.logger.info(`执行关闭函数`);
      this.config.close.call(this, this);
    }
  }
  public getRuleConfig(url: string): NRule.Config {
    const result: NRule.Config = this.rules.reduce(
      (config: NRule.Config, rule) => {
        if (rule.test(url)) {
          return { ...config, ...rule.config };
        }
        return config;
      },
      {}
    );
    return result;
  }
  public initRules(rules: NSpider.rule[]) {
    rules.forEach((rule: NSpider.rule) => {
      const r = new Rule(
        rule.name,
        rule.test,
        rule.config,
        rule.parse,
        rule.pipeline,
        rule.error
      );
      this.rules.push(r);
    });
    this.logger.info(`初始化规则,共找到${this.rules.length}个`);
  }
}
export default Spider;
