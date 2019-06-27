import * as request from "request";
import Spider from "../src/spider";
import { ErrorMiddleware } from "./spider";
import * as IHttp from "./http";
interface RuleHttpConfig extends IHttp.Config {}
export interface Config {
  baseUrl?: string;
  include?: boolean;
  http?: RuleHttpConfig;
  charset?: string;
  [key: string]: any;
}
type IError = ErrorMiddleware;
type IParse = (
  url: string,
  data: string | any,
  selector: CheerioSelector,
  config: IHttp.Config,
  spider: Spider
) => any;
type IPipeline = (item?: any, spider?: Spider) => any;
