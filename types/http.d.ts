import * as IRule from './rule'
import * as request from 'request';
export interface Config extends request.CoreOptions {
  url?: string;
  retry?:number;
  meta?: {
    [key: string]: any;
  };
  rule?: IRule.Config;
  cacheTime?: number;
  overlist?: Set<string>;
  [key: string]: any;
}
export interface MiddlewareConfig extends Config {
  url: string;
  rootConfig: Config;
}
export interface Result {
  url: string;
  data: any;
  config: Config;
}
type DownloadMiddleware = (
  config: MiddlewareConfig
) => Promise<MiddlewareConfig| false>;
export interface IHttp {
  maxConnect: number;
  connect: number;
  middlewares: Array<DownloadMiddleware>;
  config: Config;
  ifInsert(): boolean;
  run(url: string, config: Config): Promise<Result>;
  callMiddleware(config: Config): Config | false;
}
