import { EventEmitter } from 'events';
import * as IHttp from '../types/http.d';
import * as ISpider from '../types/spider.d';
import NoRepeatMid from './middleware/repeat';

import iconv from 'iconv-lite';
import rp from 'request-promise';

interface IHttpTask {
  url: string;
  config: IHttp.Config;
}
class Http extends EventEmitter implements IHttp.IHttp {
  public static clone(http: Http): Http {
    return new Http(http.config, http.middlewares);
  }
  public delay: number = 0;
  public maxConnect: number = Infinity;
  public connect: number = 0;
  public middlewares: IHttp.DownloadMiddleware[] = [];
  public timer: NodeJS.Timeout | null = null;
  public config: IHttp.Config = {
    overlist: new Set(),
    cacheMap: new Map()
  };
  private queue: IHttpTask[] = [];
  constructor(
    config: ISpider.HttpConfig = {
      repeat: false
    },
    middlewares?: IHttp.DownloadMiddleware[]
  ) {
    super();
    const cfg = (this.config = { ...this.config, ...config });
    if (cfg.maxConnect) {
      this.maxConnect = cfg.maxConnect;
      delete cfg.maxConnect;
    }
    if (cfg.delay) {
      this.maxConnect = 1;
      this.delay = cfg.delay;
      delete cfg.delay;
    }
    if (!cfg.repeat) {
      this.middlewares.push(NoRepeatMid);
      delete cfg.repeat;
    }
    if (middlewares) {
      this.middlewares = [...this.middlewares, ...middlewares];
    }
  }
  public ifInsert(): boolean {
    // console.log(this.connect, this.maxConnect, this.queue.length)
    if (this.connect < this.maxConnect) {
      return true;
    }
    return false;
  }
  public async push(
    url: string,
    config: IHttp.Config = {},
    priority: boolean = false
  ): Promise<any> {
    if (this.ifInsert()) {
      this.run(url, config);
      return;
    }
    const queue = this.queue;
    if (priority) {
      queue.unshift({ url, config });
    } else {
      queue.push({ url, config });
    }
  }
  public addOverUrl(url: string) {
    if (!this.config.overlist) {
      this.config.overlist = new Set<string>();
    }
    this.config.overlist.add(url);
  }
  public async run(url: string, config: IHttp.Config = {}): Promise<any> {
    this.connect++;
    let jump = false;
    try {
      const $config: IHttp.Config | false = await this.callMiddleware({
        url,
        ...this.config,
        ...config,
        rootConfig: this.config
      });
      if ($config === false) {
        jump = true;
        throw new Error('middleware return false');
      }
      let result = await rp(url, { jar: false, encoding: null, ...$config });
      try {
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
      } catch (err) {}
      const data: IHttp.Result = {
        url,
        config: $config,
        data: result
      };
      if (!$config.encoding) {
        const charset = $config.meta && $config.meta.charset;
        data.data = this.decode(result, charset);
      }
      this.emit('complete', data);
    } catch (error) {
      if (
        error.message !== 'middleware return false' &&
        config.retry &&
        config.retry > 0
      ) {
        this.push(url, { ...config, retry: config.retry - 1 });
        this.emit('error-retry', { url, config, error });
        return;
      }
      this.emit('error', { url, config, error });
    } finally {
      if (this.delay && !jump) {
        setTimeout(() => {
          this.complete();
        }, this.delay);
      } else {
        this.complete();
      }
    }
  }
  public appendMiddleware(
    fn: IHttp.DownloadMiddleware | IHttp.DownloadMiddleware[]
  ) {
    if (Array.isArray(fn)) {
      this.middlewares = this.middlewares.concat(fn);
      return;
    }
    this.middlewares.push(fn);
  }
  public async callMiddleware(
    config: IHttp.MiddlewareConfig
  ): Promise<IHttp.MiddlewareConfig | false> {
    let cfg: IHttp.MiddlewareConfig = config;
    for (const fn of this.middlewares) {
      const rc: IHttp.MiddlewareConfig | false = await fn(cfg);
      if (rc) {
        cfg = rc;
      } else if (rc === false) {
        return false;
      }
    }
    return cfg;
  }
  public decode(buffer: Buffer, charset?: any) {
    if (charset) {
      return iconv.decode(buffer, charset);
    }
    const tmp = iconv.decode(buffer, 'utf8');
    try {
      charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp);
      charset = charset
        .replace('charset=', '')
        .replace(/"/g, '')
        .replace('-', '')
        .trim();
    } catch (e) {
      charset = 'utf8';
    }
    if (charset.toLowerCase() === 'utf8') {
      return tmp;
    }
    return iconv.decode(buffer, charset);
  }
  private complete(): void {
    this.connect--;
    while (this.ifInsert()) {
      const task = this.queue.shift();
      if (task) {
        this.push(task.url, task.config);
      } else {
        break;
      }
    }
    if (this.connect === 0 && this.queue.length === 0) {
      this.emit('completeAll');
    }
  }
}
export default Http;
