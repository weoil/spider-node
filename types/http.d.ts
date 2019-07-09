import { Rule } from "./rule";
import * as request from "request";
export namespace Http {
  export interface Config extends request.CoreOptions {
    name?: string;
    url?: string;
    retry?: number;
    meta?: {
      [key: string]: any;
    };
    charset?: string;
    rule?: Rule.Config;
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
  ) => Promise<MiddlewareConfig | false>;
  export interface IHttp {
    maxConnect: number;
    connect: number;
    middlewares: Array<DownloadMiddleware>;
    config: Config;
    inspect(): boolean;
    run(url: string, config: Config): Promise<Result>;
    callMiddleware(config: Config): Config | false;
  }

  export interface IFetch {
    request(url: string, config: request.CoreOptions): Promise<any>;
  }
}
