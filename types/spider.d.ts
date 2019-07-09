import * as request from "request";
import Spider from "../src/spider";
import { Http } from "./http.d";
import { Rule } from "./rule.d";
import RuleModule from "../src/rule";
import HttpModule from "../src/http";

export namespace Spider {
  type ErrorMiddleware = (
    url: string,
    Error: Error,
    config: Http.Config,
    spider: Spider
  ) => void;
  export interface rule {
    name?: string;
    test: string | RegExp;
    config?: Rule.Config;
    parse?: Rule.IParse;
    pipeline?: Rule.IPipeline;
    error?: Rule.IError;
  }

  type urlsFn = () => string | string[] | Set<string>;
  interface PlanConfig {
    urls: string[] | [] | urlsFn;
    time: number;
  }
  export interface HttpConfig extends Http.Config {
    maxConnect?: number;
    log?: boolean;
    delay?: number;
    repeat?: boolean;
    meta?: {
      [key: string]: any;
    };
  }
  export interface Config {
    name?: string;
    rules?: Array<rule>;
    http?: HttpConfig;
    plan?: PlanConfig;
    open?: (spider: Spider) => Promise<any>;
    close?: (spider: Spider) => Promise<any>;
    downloadMiddleware?: [Http.DownloadMiddleware];
    errorMiddleware?: [ErrorMiddleware];
    log?: boolean;
  }
  export interface ISpider {
    config: Config;
    rules: RuleModule[];
    http: HttpConfig;
    errorMiddlewares: ErrorMiddleware[];
    init(config: Config): void;
    test(
      urls: string[] | string | urlsFn | Set<string>,
      config?: Http.Config
    ): any;
    start(
      urls: string[] | string | urlsFn | Set<string>,
      config?: Http.Config
    ): any;
    push(
      urls: string[] | string | urlsFn | Set<string>,
      config: Http.Config,
      priority: boolean
    ): any;
    rule(
      name: string,
      test: string | RegExp,
      parse: Rule.IParse,
      ...args: any[]
    ): Promise<any>;
    use(...args: Http.DownloadMiddleware[]): void;
    push(
      urls: string[] | string | Set<string> | urlsFn,
      config: Http.Config,
      priority: boolean
    ): void;
    handler(params: {
      url: string;
      data: string | object;
      config: Http.Config;
    }): Promise<any>;
    error(params: { url: string; error: Error; config: Http.Config }): void;
    onCompleteAll(): void;
    getRuleConfig(url: string): Rule.Config;
    initRules(rules: rule[]): void;
  }
}
