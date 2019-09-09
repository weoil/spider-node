import { EventEmitter } from 'events';
import iconv from 'iconv-lite';
import { Logger } from 'log4js';
import rp from 'request-promise';
import NoRepeatMid from './middleware/repeat';
import { createLogger } from './utils/logger';
import { ISpider, IRule, IHttp } from '../types';

interface IHttpTask {
  url: string;
  config: IHttp.HttpConfig;
}

export class Http extends EventEmitter {
  public static clone(http: Http): Http {
    return new Http(http.config, http.middlewares);
  }
  public logger: Logger;
  public delay: number = 0;
  public maxConnect: number = Infinity;
  public connect: number = 0;
  public middlewares: IHttp.DownloadMiddleware[] = [NoRepeatMid];
  public timer: NodeJS.Timeout | null = null;
  public ruleConnect: Map<RegExp | string, number> = new Map();
  public config: IHttp.HttpConstructorConfig = {
    overlist: new Set(),
    cacheMap: new Map(),
  };
  private queue: IHttpTask[] = [];
  constructor(
    config: IHttp.HttpConstructorConfig = {
      repeat: false,
    },
    middlewares?: IHttp.DownloadMiddleware[]
  ) {
    super();
    this.logger = createLogger(config.name || 'spider', config.log);
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
    if (middlewares) {
      this.middlewares = [...this.middlewares, ...middlewares];
    }
  }
  // addRuleConnect(config: Http.HttpRuleConfig) {
  // 	if (config.rule) {
  // 		// rule键：rule类：正则
  // 		const key = config.rule.rule;
  // 		const val = this.ruleConnect.get(key.rule) || 0;
  // 	}
  // }
  public async request(url: string, config: IHttp.HttpConfig) {
    const tmp: any = config;
    const result = await rp({
      url,
      ...tmp,
    });
    return result;
  }
  // 检测是否可以直接运行
  public inspect(url?: string, config?: IHttp.HttpConfig): boolean {
    // console.log(this.connect, this.maxConnect, this.queue.length)
    let max = this.maxConnect;
    let cur = this.connect;
    if (config && config.rule) {
      // rule键：rule类：正则
      const key = config.rule.rule;
      const val = this.ruleConnect.get(key) || 0;
      max = Math.min(config.rule.config.maxCollect || max, max);
      cur = Math.max(val, cur);
    }
    if (cur < max) {
      return true;
    }
    return false;
  }
  public async push(
    url: string,
    config: IHttp.HttpConfig,
    priority: boolean = false
  ): Promise<any> {
    if (this.inspect(url, config)) {
      this.run(url, config);
      return;
    }
    this.logger.info(`任务加入队列:${url}`);
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
  public async run(url: string, config: IHttp.HttpConfig): Promise<any> {
    const rule = config.rule;
    this.connect++;
    this.ruleConnect.set(rule.rule, (this.ruleConnect.get(rule.rule) || 0) + 1);
    this.logger.info(`正在进行请求,目前请求数量:${this.connect}:url:${url}`);
    let jump = false;
    try {
      const $config: IHttp.HttpConfig | false = await this.callMiddleware({
        url,
        ...this.config,
        ...config,
        rootConfig: this.config,
      });

      if ($config === false) {
        this.logger.info(`网络处理中间件阻止继续执:${url}`);
        jump = true;
        throw new Error('middleware return false');
      }
      let result = await this.request(url, {
        jar: false,
        encoding: null,
        ...$config,
      });
      const data: IHttp.Result = {
        url,
        config: $config,
        data: result,
      };
      if (!$config.encoding) {
        const charset =
          $config.charset || ($config.rule && $config.rule.config.charset);
        data.data = this.decode(result, charset);
      }
      try {
        if (typeof data.data === 'string' && /^(\{|\[)/.test(data.data)) {
          data.data = JSON.parse(data.data);
        }
      } catch (_) {
        // try
      }

      this.logger.info(`网络请求完成:${url}`);
      this.emit('complete', data);
    } catch (error) {
      if (error.message !== 'middleware return false' && config.retry) {
        this.push(url, { ...config, retry: config.retry - 1 });
        this.emit('error-retry', { url, config, error });
        return;
      }
      this.emit('error', { url, config, error });
    } finally {
      const delay = rule.config.delay || this.delay;
      if (delay && !jump) {
        setTimeout(() => {
          this.logger.info(`网络请求等待延迟:${url},${delay}`);
          this.complete(config);
        }, delay);
      } else {
        this.complete(config);
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
    config: IHttp.HttpMiddlewareConfig
  ): Promise<IHttp.HttpMiddlewareConfig | false> {
    let cfg: IHttp.HttpMiddlewareConfig = config;
    for (const fn of this.middlewares) {
      const rc: IHttp.HttpMiddlewareConfig | false = await fn(cfg);
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
      charset = /charset=[^"].*"|charset="[^"].*"/.exec(tmp);
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
  private complete(config: IHttp.HttpConfig): void {
    this.connect--;
    // 对应规则的连接数 --
    const val = this.ruleConnect.get(config.rule.rule);
    if (val) {
      this.ruleConnect.set(config.rule.rule, val - 1);
    }

    while (this.inspect()) {
      const task = this.queue.shift();
      if (task) {
        // 检查规则如果目前的url规则内需要延迟，则下个时序再插入回队列，防止死循环
        if (this.inspect(task.url, task.config)) {
          this.push(task.url, task.config);
        } else {
          setTimeout(() => {
            this.push(task.url, task.config);
          }, 0);
        }
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
