"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const node_schedule_1 = __importDefault(require("node-schedule"));
const http_1 = __importDefault(require("./http"));
const rule_1 = __importDefault(require("./rule"));
const logger_1 = require("./utils/logger");
const redis_1 = __importDefault(require("redis"));
const bluebird_1 = __importDefault(require("bluebird"));
var Mode;
(function (Mode) {
    Mode[Mode["development"] = 0] = "development";
    Mode[Mode["production"] = 1] = "production";
    Mode[Mode["test"] = 2] = "test";
})(Mode || (Mode = {}));
var Status;
(function (Status) {
    Status[Status["Running"] = 0] = "Running";
    Status[Status["Complete"] = 1] = "Complete";
    Status[Status["Waiting"] = 2] = "Waiting";
})(Status || (Status = {}));
class Spider extends events_1.EventEmitter {
    constructor(config, http) {
        super();
        this.cornJob = null;
        this.config = {};
        this.rules = [];
        this.status = Status.Waiting;
        this.mode = Mode.production;
        this.errorMiddlewares = [];
        this.isPlan = false;
        this.handlingCount = 0;
        this.config = { ...this.config, ...config };
        if (this.config.redis) {
            const r = redis_1.default.createClient(this.config.redis);
            this.redis = bluebird_1.default.promisifyAll(r);
        }
        if (http) {
            this.http = http_1.default.clone(http);
        }
        else {
            this.http = new http_1.default({
                ...config.http,
                name: config.name,
                log: config.log,
                redis: this.redis,
                spider: this,
            }, config.downloadMiddleware);
        }
        this.logger = logger_1.createLogger(config.name || 'spider', config.log);
        this.init(this.config);
    }
    static new(config) {
        return new Spider(config);
    }
    init(config) {
        if (config.rules) {
            this.initRules(config.rules);
        }
        if (config.errorMiddleware) {
            this.errorMiddlewares = this.errorMiddlewares.concat(config.errorMiddleware);
        }
        this.http.on('complete', this.handler.bind(this));
        this.http.on('error', this.error.bind(this));
        this.http.on('completeAll', this.onCompleteAll.bind(this));
    }
    async start(urls = [], config) {
        this.status = Status.Running;
        if (this.config.open && typeof this.config.open === 'function') {
            this.logger.info(`执行打开函数`);
            await this.config.open.call(this, this);
        }
        this.push(urls, config);
    }
    test(urls, config) {
        this.mode = Mode.test;
        this.start(urls, config);
    }
    push(urls, config = {}, priority = false) {
        let arr = [];
        if (typeof urls === 'function') {
            urls = urls();
        }
        if (Array.isArray(urls)) {
            arr = arr.concat(urls);
        }
        else if (urls instanceof Set) {
            arr = arr.concat(Array.from(urls));
        }
        else {
            arr.push(urls);
        }
        if (this.http.connect === 0 && arr.length === 0) {
            this.status = Status.Complete;
            return;
        }
        else {
            this.status = Status.Running;
        }
        arr.forEach((url) => {
            if (!url || typeof url !== 'string') {
                return;
            }
            this.logger.info(`任务推送:${url}`);
            const rule = this.getRule(url);
            const ruleHttp = rule.config.http || {};
            this.http.push(url, { ...ruleHttp, rule: rule, ...config }, priority);
        });
    }
    rule(name, test, parse, ...args) {
        let config = {};
        const c = args[args.length - 1];
        if (typeof c === 'object') {
            config = c;
            args.pop();
        }
        let rej;
        const p = new Promise((_, reject) => {
            rej = reject;
        });
        const rule = new rule_1.default(name, test, config, parse, args, (url, err, cfg) => {
            rej(url, err, cfg, this);
        });
        this.rules.push(rule);
        return p;
    }
    use(...args) {
        this.http.appendMiddleware(args);
    }
    async handler(params) {
        this.handlingCount++;
        try {
            const { url, data, config } = params;
            this.logger.info(`请求完成,等待处理,${url}`);
            const rules = this.rules.filter((rule) => {
                return rule.test(url);
            });
            // 是否从该文档提取url
            let include = true;
            for (let r of rules) {
                try {
                    if (include) {
                        include = r.isInclude();
                    }
                    this.logger.info(`正在进行数据处理:${url}`);
                    await r.call(url, data, config, this);
                }
                catch (error) {
                    this.logger.error(`数据处理异常,url:${url},error:`, error);
                    r.callError(url, error, config, this);
                }
            }
            if (!include || typeof data !== 'string' || this.mode === Mode.test) {
                return;
            }
            this.logger.info(`正在提取匹配url:${url}`);
            const urls = this.rules.reduce((set, rule) => {
                const cs = rule.match(url, data);
                cs.forEach((u) => {
                    set.add(u);
                });
                return set;
            }, new Set());
            this.push(urls);
        }
        finally {
            this.handlingCount--;
            this.onCompleteAll();
        }
    }
    error(params) {
        const { url, error, config } = params;
        this.errorMiddlewares.forEach((fn) => {
            fn.call(this, url, error, config, this);
        });
    }
    // corntab 语法定时任务 -> 秒 分 时 日 月 周几
    plan(cron, urls, immediate = true, config = { tz: 'Asia/Shanghai' }) {
        this.isPlan = true;
        if (immediate) {
            this.start(urls);
        }
        const $config = {
            rule: cron,
            ...config,
        };
        this.cornJob = node_schedule_1.default.scheduleJob($config, () => {
            if (this.status === Status.Running) {
                return;
            }
            this.start(urls);
        });
    }
    async onCompleteAll() {
        // 防止在pipeline中插入任务时检测不到http/queue里的任务，从而意外的结束任务
        if (this.handlingCount || !this.http.isIdle()) {
            return;
        }
        this.status = Status.Complete;
        this.logger.info(`任务全部完成`);
        if (!this.isPlan && !this.config.keep) {
            this.cancel();
        }
        else if (this.config.keep) {
            setTimeout(() => { }, 86400000);
        }
    }
    getRule(url) {
        for (let r of this.rules) {
            if (r.test(url)) {
                return r;
            }
        }
        throw new Error(`not fount Rule,url:${url}`);
    }
    initRules(rules) {
        const ruleArr = Array.isArray(rules) ? rules : [rules];
        ruleArr.forEach((rule) => {
            const r = new rule_1.default(rule.name, rule.test, rule.config, rule.parse, rule.pipeline, rule.error);
            this.rules.push(r);
        });
    }
    async cancel() {
        if (this.config.close && typeof this.config.close === 'function') {
            this.logger.info(`执行关闭函数`);
            await this.config.close.call(this, this);
        }
        if (this.cornJob) {
            this.cornJob.cancel(false);
        }
        if (this.redis) {
            this.redis.quit();
        }
    }
}
exports.default = Spider;
//# sourceMappingURL=spider.js.map