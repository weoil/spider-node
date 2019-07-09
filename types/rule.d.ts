import * as request from "request";
import { Spider } from "spider";
import { Http } from "./http";
import SpiderModule from "@/spider";
export namespace Rule {
  interface RuleHttpConfig extends Http.Config {}
  export interface Config {
    baseUrl?: string;
    include?: boolean;
    http?: RuleHttpConfig;
    charset?: string;
    [key: string]: any;
  }
  type IError = Spider.ErrorMiddleware;
  type IParse = (
    url: string,
    data: string | any,
    selector: CheerioSelector,
    config: Http.Config,
    spider: SpiderModule
  ) => any;
  type IPipeline = (item?: any, spider?: SpiderModule) => any;
}
