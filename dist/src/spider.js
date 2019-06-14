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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var http_1 = __importDefault(require("./http"));
var rule_1 = __importDefault(require("./rule"));
var Mode;
(function (Mode) {
    Mode[Mode["development"] = 0] = "development";
    Mode[Mode["production"] = 1] = "production";
    Mode[Mode["test"] = 2] = "test";
})(Mode || (Mode = {}));
// type RuleCbErrorCb = ((err: Error) => void) | null
// class RuleCb {
//   private ecb: RuleCbErrorCb = null
//   public register(cb: RuleCbErrorCb) {
//     this.ecb = cb
//   }
//   public take(error: Error) {
//     if (typeof this.ecb === 'function') {
//       this.ecb(error)
//     }
//   }
// }
var Spider = /** @class */ (function (_super) {
    __extends(Spider, _super);
    function Spider(config, http) {
        var _this = _super.call(this) || this;
        _this.config = {
            name: 'spider'
        };
        _this.rules = [];
        _this.mode = Mode.production;
        _this.errorMiddlewares = [];
        _this.config = __assign({}, _this.config, config);
        if (http) {
            _this.http = http_1.default.clone(http);
        }
        else {
            _this.http = new http_1.default(config.http, config.downloadMiddleware);
        }
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.open && typeof this.config.open === 'function')) return [3 /*break*/, 2];
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
        console.log('start');
    };
    Spider.prototype.push = function (urls, config, priority) {
        var _this = this;
        if (config === void 0) { config = {}; }
        if (priority === void 0) { priority = false; }
        var arr = [];
        if (Array.isArray(urls)) {
            arr = arr.concat(urls);
        }
        else {
            arr.push(urls);
        }
        arr.forEach(function (url) {
            var ruleConfig = _this.getRuleConfig(url);
            var ruleHttp = (ruleConfig && ruleConfig.http) || {};
            _this.http.push(url, __assign({}, ruleHttp, { rule: ruleConfig }, config), priority);
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
        var p = new Promise(function (resolve, reject) {
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
            var url, data, config, rules, _i, _a, r, include, urls;
            var _this = this;
            return __generator(this, function (_b) {
                url = params.url, data = params.data, config = params.config;
                rules = [];
                for (_i = 0, _a = this.rules; _i < _a.length; _i++) {
                    r = _a[_i];
                    if (r.test(url)) {
                        rules.push(r);
                    }
                }
                include = true;
                rules.forEach(function (r) { return __awaiter(_this, void 0, void 0, function () {
                    var error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                if (include) {
                                    include = r.isInclude();
                                }
                                return [4 /*yield*/, r.call(url, data, config, this)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                r.callError(url, error_1, config, this);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                if (!include || typeof data !== 'string' || this.mode === Mode.test) {
                    return [2 /*return*/];
                }
                urls = this.rules.reduce(function (set, rule) {
                    var cs = rule.match(url, data);
                    cs.forEach(function (u) {
                        set.add(u);
                    });
                    return set;
                }, new Set());
                urls.forEach(function (u) {
                    _this.push(u);
                });
                return [2 /*return*/];
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
    Spider.prototype.onCompleteAll = function () {
        var _this = this;
        if (this.config.plan) {
            var _a = this.config.plan, time = _a.time, urls_1 = _a.urls;
            setTimeout(function () {
                _this.push(urls_1);
            }, time);
        }
        else if (this.config.close && typeof this.config.close === 'function') {
            this.config.close.call(this, this);
        }
    };
    Spider.prototype.getRuleConfig = function (url) {
        var result = this.rules.reduce(function (config, rule) {
            if (rule.test(url)) {
                return __assign({}, config, rule.config);
            }
            return config;
        }, {});
        return result;
    };
    Spider.prototype.initRules = function (rules) {
        var _this = this;
        rules.forEach(function (rule) {
            var r = new rule_1.default(rule.name, rule.test, rule.config, rule.parse, rule.pipeline, rule.error);
            _this.rules.push(r);
        });
    };
    return Spider;
}(events_1.EventEmitter));
exports.default = Spider;
//# sourceMappingURL=spider.js.map