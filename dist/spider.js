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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var node_schedule_1 = __importDefault(require("node-schedule"));
var http_1 = __importDefault(require("./http"));
var rule_1 = __importDefault(require("./rule"));
var logger_1 = require("./utils/logger");
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
var Spider = /** @class */ (function (_super) {
    __extends(Spider, _super);
    function Spider(config, http) {
        var _this = _super.call(this) || this;
        _this.cornJob = null;
        _this.config = {};
        _this.rules = [];
        _this.status = Status.Waiting;
        _this.mode = Mode.production;
        _this.errorMiddlewares = [];
        _this.isPlan = false;
        _this.handlingCount = 0;
        _this.config = __assign(__assign({}, _this.config), config);
        if (http) {
            _this.http = http_1.default.clone(http);
        }
        else {
            _this.http = new http_1.default(__assign(__assign({}, config.http), { name: config.name, log: config.log, spider: _this }), config.downloadMiddleware);
        }
        _this.logger = logger_1.createLogger(config.name + "-spider-node", config.log);
        _this.init(_this.config);
        return _this;
    }
    Spider.new = function (config) {
        return new Spider(config);
    };
    Spider.prototype.init = function (config) {
        if (config.rules) {
            this.initRules(config.rules);
        }
        if (config.errorMiddleware) {
            this.errorMiddlewares = this.errorMiddlewares.concat(config.errorMiddleware);
        }
        this.http.on('complete', this.handler.bind(this));
        this.http.on('error', this.error.bind(this));
        this.http.on('completeAll', this.onCompleteAll.bind(this));
    };
    Spider.prototype.start = function (urls, config) {
        if (urls === void 0) { urls = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.open && typeof this.config.open === 'function')) return [3 /*break*/, 2];
                        this.logger.debug("\u6267\u884C\u6253\u5F00\u51FD\u6570");
                        return [4 /*yield*/, this.config.open.call(this, this)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.push(urls, config);
                        return [2 /*return*/];
                }
            });
        });
    };
    Spider.prototype.test = function (urls, config) {
        this.mode = Mode.test;
        this.start(urls, config);
    };
    Spider.prototype.push = function (urls, config, priority) {
        var _this = this;
        if (config === void 0) { config = {}; }
        if (priority === void 0) { priority = false; }
        var arr = [];
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
        arr.forEach(function (url) {
            if (!url || typeof url !== 'string') {
                return;
            }
            _this.logger.debug("\u4EFB\u52A1\u63A8\u9001:" + url);
            var rule = _this.getRule(url);
            var ruleHttp = rule.config.http || {};
            _this.http.push(url, __assign(__assign(__assign({}, ruleHttp), { rule: rule }), config), priority);
        });
    };
    Spider.prototype.rule = function (name, test, parse) {
        var _this = this;
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var config = {};
        var c = args[args.length - 1];
        if (typeof c === 'object') {
            config = c;
            args.pop();
        }
        var rej;
        var p = new Promise(function (_, reject) {
            rej = reject;
        });
        var rule = new rule_1.default(name, test, config, parse, args, function (url, err, cfg) {
            rej(url, err, cfg, _this);
        });
        this.rules.push(rule);
        return p;
    };
    Spider.prototype.use = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.http.appendMiddleware(args);
    };
    Spider.prototype.handler = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var url_1, data_1, config, rules, include, _i, rules_1, r, error_1, urls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.handlingCount++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 8, 9]);
                        url_1 = params.url, data_1 = params.data, config = params.config;
                        this.logger.debug("\u8BF7\u6C42\u5B8C\u6210,\u7B49\u5F85\u5904\u7406," + url_1);
                        rules = this.rules.filter(function (rule) {
                            return rule.test(url_1);
                        });
                        include = true;
                        _i = 0, rules_1 = rules;
                        _a.label = 2;
                    case 2:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 7];
                        r = rules_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        if (include) {
                            include = r.isInclude();
                        }
                        this.logger.debug("\u6B63\u5728\u8FDB\u884C\u6570\u636E\u5904\u7406:" + url_1);
                        return [4 /*yield*/, r.call(url_1, data_1, config, this)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        this.logger.error("\u6570\u636E\u5904\u7406\u5F02\u5E38,url:" + url_1 + ",error:", error_1);
                        r.callError(url_1, error_1, config, this);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        if (!include || typeof data_1 !== 'string' || this.mode === Mode.test) {
                            return [2 /*return*/];
                        }
                        this.logger.debug("\u6B63\u5728\u63D0\u53D6\u5339\u914Durl:" + url_1);
                        urls = this.rules.reduce(function (set, rule) {
                            var cs = rule.match(url_1, data_1);
                            cs.forEach(function (u) {
                                set.add(u);
                            });
                            return set;
                        }, new Set());
                        this.push(urls);
                        return [3 /*break*/, 9];
                    case 8:
                        this.handlingCount--;
                        if (this.handlingCount <= 0) {
                            this.onCompleteAll();
                        }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Spider.prototype.error = function (params) {
        var _this = this;
        var url = params.url, error = params.error, config = params.config;
        this.errorMiddlewares.forEach(function (fn) {
            fn.call(_this, url, error, config, _this);
        });
    };
    // corntab 语法定时任务 -> 秒 分 时 日 月 周几
    Spider.prototype.plan = function (rule, urls, immediate) {
        var _this = this;
        if (immediate === void 0) { immediate = true; }
        this.isPlan = true;
        if (immediate) {
            this.start(urls);
        }
        this.cornJob = node_schedule_1.default.scheduleJob(rule, function () {
            if (_this.getStatus()) {
                _this.logger.debug("\u5B9A\u65F6\u4EFB\u52A1\u56E0\u4EFB\u52A1\u5C1A\u672A\u7ED3\u675F\u88AB\u6401\u6D45,\u51FD\u6570\u6267\u884C:" + _this.handlingCount + ",http\u8FD0\u884C\u72B6\u6001:" + _this.http.isIdle());
                return;
            }
            _this.start(urls);
        });
    };
    Spider.prototype.getStatus = function () {
        return Boolean(this.handlingCount || !this.http.isIdle());
    };
    Spider.prototype.onCompleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 防止在pipeline中插入任务时检测不到http/queue里的任务，从而意外的结束任务
                if (this.getStatus()) {
                    return [2 /*return*/];
                }
                this.logger.debug("\u4EFB\u52A1\u5168\u90E8\u5B8C\u6210");
                if (!this.isPlan) {
                    this.logger.debug("\u6CA1\u6709\u5B9A\u65F6\u4EFB\u52A1,\u7A0B\u5E8F\u9000\u51FA");
                    this.cancel();
                }
                return [2 /*return*/];
            });
        });
    };
    Spider.prototype.getRule = function (url) {
        for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
            var r = _a[_i];
            if (r.test(url)) {
                return r;
            }
        }
        throw new Error("not fount Rule,url:" + url);
    };
    Spider.prototype.initRules = function (rules) {
        var _this = this;
        var ruleArr = Array.isArray(rules) ? rules : [rules];
        ruleArr.forEach(function (rule) {
            var r = new rule_1.default(rule.name, rule.test, rule.config, rule.parse, rule.pipeline, rule.error);
            _this.rules.push(r);
        });
    };
    Spider.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.close && typeof this.config.close === 'function')) return [3 /*break*/, 2];
                        this.logger.debug("\u6267\u884C\u5173\u95ED\u51FD\u6570");
                        return [4 /*yield*/, this.config.close.call(this, this)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.cornJob) {
                            this.cornJob.cancel(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Spider;
}(events_1.EventEmitter));
exports.default = Spider;
//# sourceMappingURL=spider.js.map