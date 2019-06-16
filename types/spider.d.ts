import * as request from 'request';
import Spider from '../src/spider';
import * as IHttp from './http.d';
import * as IRule from './rule.d';
import Rule from '../src/rule';
import Http from '../src/http';
type ErrorMiddleware = (
  url: string,
  Error: Error,
  config: IHttp.Config,
  spider: Spider
) => void;
export interface rule {
  name?: string;
  test: string | RegExp;
  config?: IRule.Config;
  parse?: IRule.IParse;
  pipeline?: IRule.IPipeline;
  error?: IRule.IError;
}
interface PlanConfig {
  urls: string[] | [];
  time: number;
}
export interface HttpConfig extends IHttp.Config {
  maxConnect?: number;
  delay?: number;
  repeat?: boolean;
  meta?: {
    [key: string]: any;
  };
  $system?: {
    overlist?: Map<string, any>;
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
  downloadMiddleware?: [IHttp.DownloadMiddleware];
  errorMiddleware?: [ErrorMiddleware];
  log?: boolean;
}
export interface ISpider {
  config: Config;
  rules: Rule[];
  http: HttpConfig;
  errorMiddlewares: ErrorMiddleware[];
  init(config: Config): void;
  start(urls: string[] | string, config?: IHttp.Config): any;
  rule(
    name: string,
    test: string | RegExp,
    parse: IRule.IParse,
    ...args: any[]
  ): Promise<any>;
  use(...args: IHttp.DownloadMiddleware[]): void;
  push(
    urls: string[] | string | Set<string>,
    config: IHttp.Config,
    priority: boolean
  ): void;
  handler(params: {
    url: string;
    data: string | object;
    config: IHttp.Config;
  }): Promise<any>;
  error(params: { url: string; error: Error; config: IHttp.Config }): void;
  onCompleteAll(): void;
  getRuleConfig(url: string): IRule.Config;
  initRules(rules: rule[]): void;
}
