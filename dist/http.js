"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const request_promise_1 = __importDefault(require("request-promise"));
const repeat_1 = __importDefault(require("./middleware/repeat"));
const logger_1 = require("./utils/logger");
class Http extends events_1.EventEmitter {
    // private queue = new Map<Rule, IHttpTask[]>();
    constructor(config = {
        repeat: false,
        meta: {},
    }, middlewares) {
        super();
        this.delay = 0;
        this.maxConnect = Infinity;
        this.connect = 0;
        this.middlewares = [repeat_1.default];
        this.timer = null;
        this.pool = new Map();
        // public ruleConnect: Map<RegExp | string, number> = new Map();
        this.config = {
            overlist: new Set(),
            cacheMap: new Map(),
            meta: {},
        };
        this.logger = logger_1.createLogger(`${config.name}-http`, config.log);
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
    static clone(http) {
        return new Http(http.config, http.middlewares);
    }
    // addRuleConnect(config: Http.HttpRuleConfig) {
    // 	if (config.rule) {
    // 		// rule键：rule类：正则
    // 		const key = config.rule.rule;
    // 		const val = this.ruleConnect.get(key.rule) || 0;
    // 	}
    // }
    async request(url, config) {
        const tmp = config;
        const result = await request_promise_1.default({
            url,
            ...tmp,
            resolveWithFullResponse: true,
        });
        return result;
    }
    // 检测是否可以直接运行
    inspect(url, config) {
        let ruleParam = this.pool.get(config.rule.rule);
        let cur = ruleParam.connect;
        let max = config.rule.config.maxCollect || this.maxConnect;
        return cur < max;
    }
    async push(url, config, priority = false) {
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
        }
        else {
            queue.push({ url, config });
        }
    }
    addOverUrl(url) {
        if (!this.config.overlist) {
            this.config.overlist = new Set();
        }
        this.config.overlist.add(url);
    }
    async run(url, config) {
        const rule = config.rule;
        this.connect++;
        this.pool.get(rule.rule).connect += 1;
        this.logger.debug(`正在进行请求,目前请求数量:${this.connect}:url:${url}`);
        let hasErr = false;
        try {
            const $config = await this.callMiddleware({
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
            const data = {
                url,
                config: { ...$config, response: response },
                data: result,
            };
            if (!$config.encoding) {
                const charset = $config.charset || ($config.rule && $config.rule.config.charset);
                data.data = this.decode(result, charset);
            }
            try {
                if (typeof data.data === 'string' && /^(\{|\[)/.test(data.data)) {
                    data.data = JSON.parse(data.data);
                }
            }
            catch (_) {
                // try
            }
            this.logger.debug(`网络请求完成:${url}`);
            this.emit('complete', data);
        }
        catch (error) {
            if (error.message !== 'middleware return false' && config.retry) {
                this.push(url, { ...config, retry: config.retry - 1 });
                this.emit('error-retry', { url, config, error });
                return;
            }
            this.emit('error', { url, config, error });
        }
        finally {
            this.connect--;
            const delay = rule.config.delay || this.delay;
            if (delay && !hasErr) {
                this.logger.debug(`网络请求等待延迟:${url},${delay}`);
                setTimeout(() => {
                    this.complete(url, config);
                }, delay);
            }
            else {
                this.complete(url, config);
            }
        }
    }
    appendMiddleware(fn) {
        if (Array.isArray(fn)) {
            this.middlewares = this.middlewares.concat(fn);
            return;
        }
        this.middlewares.push(fn);
    }
    async callMiddleware(config) {
        let cfg = config;
        for (const fn of this.middlewares) {
            const rc = await fn(cfg);
            if (rc) {
                cfg = rc;
            }
            else if (rc === false) {
                return false;
            }
        }
        return cfg;
    }
    decode(buffer, charset) {
        if (charset) {
            return iconv_lite_1.default.decode(buffer, charset);
        }
        const tmp = iconv_lite_1.default.decode(buffer, 'utf8');
        try {
            charset = /charset=[^"].*"|charset="[^"].*"/.exec(tmp);
            charset = charset
                .replace('charset=', '')
                .replace(/"/g, '')
                .replace('-', '')
                .trim();
        }
        catch (e) {
            charset = 'utf8';
        }
        if (charset.toLowerCase() === 'utf8') {
            return tmp;
        }
        return iconv_lite_1.default.decode(buffer, charset);
    }
    complete(url, config) {
        // 对应规则的连接数 --
        let ruleParam = this.pool.get(config.rule.rule);
        ruleParam.connect -= 1;
        while (this.inspect(url, config)) {
            const task = ruleParam.queue.shift();
            if (task) {
                this.push(task.url, task.config);
            }
            else {
                break;
            }
        }
        this.logger.debug(`当前规则总任务数：${ruleParam.queue.length},当前运行总数量:${this.connect}`);
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
    isIdle() {
        for (let rp of Array.from(this.pool.values())) {
            let len = rp.queue.length || rp.connect;
            if (len) {
                return false;
            }
        }
        return true;
    }
}
exports.Http = Http;
exports.default = Http;
//# sourceMappingURL=http.js.map