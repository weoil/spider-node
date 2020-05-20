import Rule from './../src/rule';
import Spider from '../src/spider';
import request, { RequestResponse } from 'request';
export namespace ISpider {
  type ErrorMiddleware = (
    url: string,
    Error: Error,
    config: IHttp.HttpConfig,
    spider: Spider
  ) => void;
  export interface SpiderHttpConfig extends IHttp.HttpConfig {
    maxConnect?: number;
    log?: boolean;
    delay?: number;
    meta?: {
      [key: string]: any;
    };
  }
  export interface SpiderRuleConfig {
    name?: string;
    test: string | RegExp;
    config?: IRule.RuleConfig;
    parse?: IRule.RuleParse;
    pipeline?: IRule.RulePipeline;
    error?: IRule.RuleError;
  }

  type urlsFn = () => string | string[] | Set<string>;

  export interface Config {
    name?: string;
    rules?: Array<SpiderRuleConfig>;
    http?: IHttp.HttpConstructorConfig;
    open?: (spider: Spider) => Promise<any>;
    close?: (spider: Spider) => Promise<any>;
    downloadMiddleware?: IHttp.DownloadMiddleware[];
    errorMiddleware?: ErrorMiddleware[];
    log?: boolean;
  }
}

export namespace IRule {
  export interface RuleConfig {
    baseUrl?: string;
    include?: boolean;
    http?: IHttp.HttpConstructorConfig;
    charset?: string;
    maxCollect?: number;
    delay?: number;
    [key: string]: any;
  }
  type RuleError = ISpider.ErrorMiddleware;
  export interface RuleHttpConfig extends IHttp.HttpResultConfig {
    meta: {
      [key: string]: any;
    };
  }
  type RuleParse = (
    url: string,
    data: string | any,
    selector: CheerioSelector,
    config: RuleHttpConfig,
    spider: Spider
  ) => any;
  type RulePipeline = (item: any, spider: Spider) => any;
}

export namespace IHttp {
  export interface HttpRuleConfig extends IRule.RuleConfig {
    rule: Rule;
  }
  export interface HttpConstructorConfig extends request.CoreOptions {
    spider?: Spider;
    name?: string;
    url?: string;
    retry?: number;
    meta?: {
      [key: string]: any;
    };
    charset?: string;
    [key: string]: any;
  }
  export interface HttpConfig extends HttpConstructorConfig {
    rule: Rule;
  }
  export interface HttpMiddlewareConfig extends HttpConfig {
    url: string;
    rootConfig: HttpConstructorConfig;
  }
  export interface HttpResultConfig extends HttpConfig {
    response: RequestResponse;
  }
  export interface Result {
    url: string;
    data: any;
    config: HttpResultConfig;
  }
  type DownloadMiddleware = (
    config: HttpMiddlewareConfig
  ) => Promise<HttpMiddlewareConfig | false>;
}
