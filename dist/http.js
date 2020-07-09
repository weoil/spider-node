"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var iconv_lite_1 = __importDefault(require("iconv-lite"));
var request_promise_1 = __importDefault(require("request-promise"));
var logger_1 = require("./utils/logger");
var Http = /** @class */ (function (_super) {
    __extends(Http, _super);
    // private queue = new Map<Rule, IHttpTask[]>();
    function Http(config, middlewares) {
        if (config === void 0) { config = {
            repeat: false,
            meta: {},
        }; }
        var _this = _super.call(this) || this;
        _this.delay = 0;
        _this.maxConnect = Infinity;
        _this.connect = 0;
        _this.middlewares = [];
        _this.timer = null;
        _this.pool = new Map();
        // public ruleConnect: Map<RegExp | string, number> = new Map();
        _this.config = {
            overlist: new Set(),
            cacheMap: new Map(),
            meta: {},
        };
        _this.logger = logger_1.createLogger(config.name + "-http", config.log);
        var cfg = (_this.config = __assign(__assign({}, _this.config), config));
        if (cfg.maxConnect) {
            _this.maxConnect = cfg.maxConnect;
            delete cfg.maxConnect;
        }
        if (cfg.delay) {
            _this.maxConnect = 1;
            _this.delay = cfg.delay;
            delete cfg.delay;
        }
        if (middlewares) {
            _this.middlewares = __spreadArrays(_this.middlewares, middlewares);
        }
        return _this;
    }
    Http.clone = function (http) {
        return new Http(http.config, http.middlewares);
    };
    // addRuleConnect(config: Http.HttpRuleConfig) {
    // 	if (config.rule) {
    // 		// rule键：rule类：正则
    // 		const key = config.rule.rule;
    // 		const val = this.ruleConnect.get(key.rule) || 0;
    // 	}
    // }
    Http.prototype.request = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            var tmp, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tmp = config;
                        return [4 /*yield*/, request_promise_1.default(__assign(__assign({ url: url }, tmp), { resolveWithFullResponse: true }))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    // 检测是否可以直接运行
    Http.prototype.inspect = function (url, config) {
        var ruleParam = this.pool.get(config.rule.rule);
        var cur = ruleParam.connect;
        var max = config.rule.config.maxCollect || this.maxConnect;
        return cur < max;
    };
    Http.prototype.push = function (url, config, priority) {
        if (priority === void 0) { priority = false; }
        return __awaiter(this, void 0, void 0, function () {
            var ruleParam, queue;
            return __generator(this, function (_a) {
                ruleParam = this.pool.get(config.rule.rule);
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
                    return [2 /*return*/];
                }
                this.logger.debug("\u4EFB\u52A1\u52A0\u5165\u961F\u5217:" + url);
                queue = ruleParam.queue;
                if (priority) {
                    queue.unshift({ url: url, config: config });
                }
                else {
                    queue.push({ url: url, config: config });
                }
                return [2 /*return*/];
            });
        });
    };
    Http.prototype.addOverUrl = function (url) {
        if (!this.config.overlist) {
            this.config.overlist = new Set();
        }
        this.config.overlist.add(url);
    };
    Http.prototype.run = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            var rule, hasErr, $config, response, result, data, charset, error_1, ruleTaskLen, delay;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rule = config.rule;
                        this.connect++;
                        this.pool.get(rule.rule).connect += 1;
                        this.logger.debug("\u6B63\u5728\u8FDB\u884C\u8BF7\u6C42,\u76EE\u524D\u8BF7\u6C42\u6570\u91CF:" + this.connect + ":url:" + url);
                        hasErr = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, this.callMiddleware(__assign(__assign(__assign({ url: url }, this.config), config), { rootConfig: this.config }))];
                    case 2:
                        $config = _a.sent();
                        if ($config === false) {
                            this.logger.debug("\u7F51\u7EDC\u5904\u7406\u4E2D\u95F4\u4EF6\u963B\u6B62\u7EE7\u7EED\u6267:" + url);
                            hasErr = true;
                            throw new Error('middleware return false');
                        }
                        return [4 /*yield*/, this.request(url, __assign({ jar: false, encoding: null }, $config))];
                    case 3:
                        response = _a.sent();
                        result = response.body;
                        data = {
                            url: url,
                            config: __assign(__assign({}, $config), { response: response }),
                            data: result,
                        };
                        if (!$config.encoding) {
                            charset = $config.charset || ($config.rule && $config.rule.config.charset);
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
                        this.logger.debug("\u7F51\u7EDC\u8BF7\u6C42\u5B8C\u6210:" + url);
                        this.emit('complete', data);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1.message !== 'middleware return false' && config.retry) {
                            this.push(url, __assign(__assign({}, config), { retry: config.retry - 1 }));
                            this.emit('error-retry', { url: url, config: config, error: error_1 });
                            return [2 /*return*/];
                        }
                        this.emit('error', { url: url, config: config, error: error_1 });
                        return [3 /*break*/, 6];
                    case 5:
                        this.connect--;
                        ruleTaskLen = this.pool.get(rule.rule).queue
                            .length;
                        delay = rule.config.delay || this.delay;
                        if (ruleTaskLen > 0 && delay && !hasErr) {
                            this.logger.debug("\u7F51\u7EDC\u8BF7\u6C42\u7B49\u5F85\u5EF6\u8FDF:" + url + "," + delay);
                            setTimeout(function () {
                                _this.complete(url, config);
                            }, delay);
                        }
                        else {
                            this.complete(url, config);
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Http.prototype.useMiddleware = function (fn) {
        if (Array.isArray(fn)) {
            this.middlewares = this.middlewares.concat(fn);
            return;
        }
        this.middlewares.push(fn);
    };
    Http.prototype.callMiddleware = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var cfg, _i, _a, fn, rc;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cfg = config;
                        _i = 0, _a = this.middlewares;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        fn = _a[_i];
                        return [4 /*yield*/, fn(cfg)];
                    case 2:
                        rc = _b.sent();
                        if (rc) {
                            cfg = rc;
                        }
                        else if (rc === false) {
                            return [2 /*return*/, false];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, cfg];
                }
            });
        });
    };
    Http.prototype.decode = function (buffer, charset) {
        if (charset) {
            return iconv_lite_1.default.decode(buffer, charset);
        }
        var tmp = iconv_lite_1.default.decode(buffer, 'utf8');
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
    };
    Http.prototype.complete = function (url, config) {
        // 对应规则的连接数 --
        var ruleParam = this.pool.get(config.rule.rule);
        ruleParam.connect -= 1;
        while (this.inspect(url, config)) {
            var task = ruleParam.queue.shift();
            if (task) {
                this.push(task.url, task.config);
            }
            else {
                break;
            }
        }
        this.logger.debug("\u5F53\u524D\u89C4\u5219\u603B\u4EFB\u52A1\u6570\uFF1A" + ruleParam.queue.length + ",\u5F53\u524D\u8FD0\u884C\u603B\u6570\u91CF:" + this.connect);
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
    };
    // 检测是否空闲
    Http.prototype.isIdle = function () {
        for (var _i = 0, _a = Array.from(this.pool.values()); _i < _a.length; _i++) {
            var rp_1 = _a[_i];
            var len = rp_1.queue.length || rp_1.connect;
            if (len) {
                return false;
            }
        }
        return true;
    };
    return Http;
}(events_1.EventEmitter));
exports.Http = Http;
exports.default = Http;
//# sourceMappingURL=http.js.map