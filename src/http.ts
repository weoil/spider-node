import * as rp from "request-promise";
import * as iconv from "iconv-lite";
import { HttpImp, HttpConfig } from "./types/spider";
import Logger from "./util/logConfig";
const log: Logger.Logger = Logger.getLogger("spider");
async function RemoveRepeatMiddleware(url: string, config: HttpConfig) {
  if (config.norepeat) {
    let flag = !config.overList.has(url);
    config.overList.add(url);
    return flag;
  }
}

class Http implements HttpImp {
  config: any;
  middleware: any[];
  errorMiddleware: any[];
  constructor(config: HttpConfig, middleware?: any[], errorMiddleware?: any[]) {
    this.config = config;
    this.middleware = [...middleware, RemoveRepeatMiddleware];
    this.errorMiddleware = errorMiddleware;
  }
  private async callMiddleware(url: string, middleware: any[], ...args: any[]) {
    if (!middleware) return true;
    for (const mid of middleware) {
      let result = await mid(url, ...args);
      if (result === false) return false;
    }
  }
  async request(url: string) {
    try {
      let result = await this.callMiddleware(url, this.middleware, this.config);
      if (result === false) return;
      let res = await rp.get(url, {
        ...this.config.http,
        encoding: null,
        jar: false
      });
      let data = this.decode(res, this.config["charset"]);
      return data;
    } catch (e) {
      return e;
    }
  }
  public decode(buffer: any, charset?: string) {
    if (charset) {
      return iconv.decode(buffer, charset);
    }
    let tmp = iconv.decode(buffer, "utf8");
    try {
      charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp)[0];
      charset = charset
        .replace("charset=", "")
        .replace(/"/g, "")
        .replace("-", "")
        .trim();
    } catch (e) {
      charset = "utf8";
    }
    if (charset.toLowerCase() === "utf8") {
      return tmp;
    }
    return iconv.decode(buffer, charset);
  }
}

export default Http;
