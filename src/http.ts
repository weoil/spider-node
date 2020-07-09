import { Rule } from './rule';
import { EventEmitter } from 'events';
import iconv from 'iconv-lite';
import { Logger } from 'log4js';
import rp from 'request-promise';
import { createLogger } from './utils/logger';
import { ISpider, IRule, IHttp } from '../types';

interface IHttpTask {
  url: string;
  config: IHttp.HttpConfig;
}
interface IRuleParams {
  rule: Rule<any>;
  queue: IHttpTask[];
  connect: number;
}
export class Http extends EventEmitter {
  public static clone(http: Http): Http {
    return new Http(http.config, http.middlewares);
  }
  public logger: Logger;
  public delay: number = 0;
  public maxConnect: number = Infinity;
  public connect: number = 0;
  public middlewares: IHttp.Middleware[] = [];
  public timer: NodeJS.Timeout | null = null;
  public pool: Map<RegExp, IRuleParams> = new Map<RegExp, IRuleParams>();
  // public ruleConnect: Map<RegExp | string, number> = new Map();
  public config: IHttp.HttpConstructorConfig = {
    overlist: new Set(),
    cacheMap: new Map(),
    meta: {},
  };
  // private queue = new Map<Rule, IHttpTask[]>();
  constructor(
    config: IHttp.HttpConstructorConfig = {
      repeat: false,
      meta: {},
    },
    middlewares?: IHttp.Middleware[]
  ) {
    super();
    this.logger = createLogger(`${config.name}-http`, config.log);
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
  private async request(url: string, config: IHttp.HttpConfig) {
    const tmp: any = config;
    const result = await rp({
      url,
      ...tmp,
      resolveWithFullResponse: true,
    });
    return result;
  }

  // 检测是否可以直接运行
  public inspect(url: string, config: { rule: Rule<any> }): boolean {
    let ruleParam = this.pool.get(config.rule.rule) as IRuleParams;
    let cur = ruleParam.connect;
    let max = config.rule.config.maxCollect || this.maxConnect;
    return cur < max;
  }

  public async push(
    url: string,
    config: IHttp.HttpConfig,
    priority: boolean = false
  ): Promise<any> {
    let ruleParam = this.pool.get(config.rule.rule);
    if (!ruleParam) {
      ruleParam = {
        rule: config.rule,
        connect: 0,
        queue: [],
      };
      this.pool.set(config.rule.rule, ruleParam);
    }
    if (this.inspect(url, config)) {
      this.run(url, config);
      return;
    }
    this.logger.debug(`任务加入队列:${url}`);

    const queue = ruleParam.queue;
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
  private async run(url: string, config: IHttp.HttpConfig): Promise<any> {
    const rule = config.rule;
    this.connect++;
    (this.pool.get(rule.rule) as IRuleParams).connect += 1;
    this.logger.debug(`正在进行请求,目前请求数量:${this.connect}:url:${url}`);
    let hasErr = false;
    try {
      const $config: IHttp.HttpConfig | false = await this.callMiddleware({
        url,
        ...this.config,
        ...config,
        rootConfig: this.config,
      });

      if ($config === false) {
        this.logger.debug(`网络处理中间件阻止继续执:${url}`);
        hasErr = true;
        throw new Error('middleware return false');
      }
      let response = await this.request(url, {
        jar: false,
        encoding: null,
        ...$config,
      });
      const result = response.body;
      const data: IHttp.Result = {
        url,
        config: { ...$config, response: response },
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

      this.logger.debug(`网络请求完成:${url}`);
      this.emit('complete', data);
    } catch (error) {
      if (error.message !== 'middleware return false' && config.retry) {
        this.push(url, { ...config, retry: config.retry - 1 });
        this.emit('error-retry', { url, config, error });
        return;
      }
      this.emit('error', { url, config, error });
    } finally {
      this.connect--;
      const ruleTaskLen = (this.pool.get(rule.rule) as IRuleParams).queue
        .length;
      const delay = rule.config.delay || this.delay;
      if (ruleTaskLen > 0 && delay && !hasErr) {
        this.logger.debug(`网络请求等待延迟:${url},${delay}`);
        setTimeout(() => {
          this.complete(url, config);
        }, delay);
      } else {
        this.complete(url, config);
      }
    }
  }
  public useMiddleware(fn: IHttp.Middleware | IHttp.Middleware[]) {
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
  private complete(url: string, config: IHttp.HttpConfig): void {
    // 对应规则的连接数 --
    let ruleParam = this.pool.get(config.rule.rule) as IRuleParams;
    ruleParam.connect -= 1;
    while (this.inspect(url, config)) {
      const task = ruleParam.queue.shift();
      if (task) {
        this.push(task.url, task.config);
      } else {
        break;
      }
    }
    this.logger.debug(
      `当前规则总任务数：${ruleParam.queue.length},当前运行总数量:${this.connect}`
    );
    if (this.isIdle()) {
      this.emit('completeAll');
    }
    // for (let $rule of Array.from(this.queue.keys())) {
    //   if (this.connect >= this.maxConnect) {
    //     return;
    //   }
    //   const queue = this.queue.get($rule);
    //   if (!queue) return;
    //   while (this.inspect('', { rule: $rule })) {
    //     const task = queue.shift();
    //     if (task) {
    //       this.push(task.url, task.config);
    //     } else {
    //       break;
    //     }
    //   }
    // }
  }
  // 检测是否空闲
  public isIdle() {
    for (let rp of Array.from(this.pool.values())) {
      let len = rp.queue.length || rp.connect;
      if (len) {
        return false;
      }
    }
    return true;
  }
}
export default Http;
