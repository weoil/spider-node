import { EventEmitter } from "events";
import { Logger } from "log4js";
import * as IHttp from "../types/http.d";
import * as IRule from "../types/rule.d";
import * as ISpider from "../types/spider.d";
import Http from "./http";
import Rule from "./rule";
import { createLogger } from "./utils/logger";

enum Mode {
  development,
  production,
  test
}

class Spider extends EventEmitter implements ISpider.ISpider {
  public static new(config: ISpider.Config) {
    return new Spider(config);
  }
  public config: ISpider.Config = {
    name: "spider"
  };
  public logger: Logger;
  public rules: Rule[] = [];
  public http: Http;
  public mode: Mode = Mode.production;
  public errorMiddlewares: ISpider.ErrorMiddleware[] = [];
  constructor(config: ISpider.Config, http?: Http) {
    super();
    this.config = { ...this.config, ...config };
    if (http) {
      this.http = Http.clone(http);
    } else {
      this.http = new Http(
        { ...config.http, name: config.name },
        config.downloadMiddleware
      );
    }
    this.logger = createLogger(config.name || "spider");
    this.init(this.config);
  }
  public init(config: ISpider.Config) {
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
  public async start(urls: string[] | string, config?: IHttp.Config) {
    if (this.config.open && typeof this.config.open === "function") {
      this.logger.info(`执行打开函数`);
      await this.config.open.call(this, this);
    }
    this.push(urls, config);
  }
  public test(urls: string[] | string, config?: IHttp.Config) {
    this.mode = Mode.test;
    this.start(urls, config);
  }
  public push(
    urls: string[] | string | Set<string>,
    config: IHttp.Config = {},
    priority: boolean = false
  ) {
    let arr: string[] = [];
    if (Array.isArray(urls)) {
      arr = arr.concat(urls);
    } else if (urls instanceof Set) {
      arr = arr.concat(...urls.values());
    } else {
      arr.push(urls);
    }
    arr.forEach((url: string) => {
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
    parse: IRule.IParse,
    ...args: any[]
  ): Promise<any> {
    let config: IRule.Config = {};
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
      (url: string, err: Error, cfg: IRule.Config) => {
        rej(url, err, cfg, this);
      }
    );
    this.rules.push(rule);
    return p;
  }
  public use(...args: IHttp.DownloadMiddleware[]): void {
    this.http.appendMiddleware(args);
  }
  public async handler(params: {
    url: string;
    data: string | object;
    config: IHttp.Config;
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
  public error(params: { url: string; error: Error; config: IHttp.Config }) {
    const { url, error, config } = params;
    this.errorMiddlewares.forEach((fn: ISpider.ErrorMiddleware) => {
      fn.call(this, url, error, config, this);
    });
  }
  public onCompleteAll() {
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
  public getRuleConfig(url: string): IRule.Config {
    const result: IRule.Config = this.rules.reduce(
      (config: IRule.Config, rule) => {
        if (rule.test(url)) {
          return { ...config, ...rule.config };
        }
        return config;
      },
      {}
    );
    return result;
  }
  public initRules(rules: ISpider.rule[]) {
    rules.forEach((rule: ISpider.rule) => {
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
