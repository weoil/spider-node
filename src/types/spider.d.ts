import { EventEmitter } from "events";

export interface spiderConfig {
  name: string;
  rules: Array<ruleImp>;
  http: any;
  charset?: string;
  maxConnect?: number;
  overList?: Set<string>;
  plan?: boolean;
  delay?: number;
  open?: any;
  close?: any;
  norepeat?: boolean;
  downloadMiddleware?: any[];
  errorMiddleware?: any[];
  log?: Boolean;
}
export interface planImp {
  interval: number;
  findlist?: any[];
  include?: any[];
  url: string | Array<string>;
  timer?: any;
}
export interface ruleImp {
  test: RegExp;
  baseUrl?: String;
  parse?(url: string, content: string, selector: any): any;
  pipeline?(item: any): void;
}
export interface HttpImp {
  config: any;
  middleware: any[];
  errorMiddleware: any[];
  request(url: string): any;
}
export interface HttpConfig {
  http: any;
  overList: Set<String>;
  norepeat: boolean;
}
export interface CrawlConfig {
  maxConnect?: number;
}
export interface CrawlImp {
  spiders: { [key: string]: SpiderImp };
  isTest: boolean;
  runCount: number;
  config: CrawlConfig;
  middleware: { [key: string]: Array<any> };
  isFirstStart: boolean;
  hasPlan: boolean;
}
export interface SpiderImp {
  config: spiderConfig;
  tasklist: Array<string>;
  runCount: number;
  http: HttpImp;
  plan?: planImp;
  parseCount: number;
}
export default class Crawl extends EventEmitter {
  constructor(config?: CrawlConfig);
  registry(name: string, config: spiderConfig): void;
  start(name: string, url: string | Array<string>, plan?: any): void;
  test(name: string, url: string | Array<string>): void;
}
