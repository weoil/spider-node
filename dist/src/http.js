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
var repeat_1 = __importDefault(require("./middleware/repeat"));
var iconv_lite_1 = __importDefault(require("iconv-lite"));
var request_promise_1 = __importDefault(require("request-promise"));
var Http = /** @class */ (function (_super) {
    __extends(Http, _super);
    function Http(config, middlewares) {
        if (config === void 0) { config = {
            repeat: false
        }; }
        var _this = _super.call(this) || this;
        _this.delay = 0;
        _this.maxConnect = Infinity;
        _this.connect = 0;
        _this.middlewares = [];
        _this.timer = null;
        _this.config = {
            overlist: new Set(),
            cacheMap: new Map()
        };
        _this.queue = [];
        var cfg = (_this.config = __assign({}, _this.config, config));
        if (cfg.maxConnect) {
            _this.maxConnect = cfg.maxConnect;
            delete cfg.maxConnect;
        }
        if (cfg.delay) {
            _this.maxConnect = 1;
            _this.delay = cfg.delay;
            delete cfg.delay;
        }
        if (!cfg.repeat) {
            _this.middlewares.push(repeat_1.default);
            delete cfg.repeat;
        }
        if (middlewares) {
            _this.middlewares = _this.middlewares.concat(middlewares);
        }
        return _this;
    }
    Http.clone = function (http) {
        return new Http(http.config, http.middlewares);
    };
    Http.prototype.ifInsert = function () {
        // console.log(this.connect, this.maxConnect, this.queue.length)
        if (this.connect < this.maxConnect) {
            return true;
        }
        return false;
    };
    Http.prototype.push = function (url, config, priority) {
        if (config === void 0) { config = {}; }
        if (priority === void 0) { priority = false; }
        return __awaiter(this, void 0, void 0, function () {
            var queue;
            return __generator(this, function (_a) {
                if (this.ifInsert()) {
                    this.run(url, config);
                    return [2 /*return*/];
                }
                queue = this.queue;
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
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var jump, $config, result, data, charset, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.connect++;
                        jump = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, this.callMiddleware(__assign({ url: url }, this.config, config, { rootConfig: this.config }))];
                    case 2:
                        $config = _a.sent();
                        if ($config === false) {
                            jump = true;
                            throw new Error('middleware return false');
                        }
                        return [4 /*yield*/, request_promise_1.default(url, __assign({ jar: false, encoding: null }, $config))];
                    case 3:
                        result = _a.sent();
                        try {
                            if (typeof result === 'string') {
                                result = JSON.parse(result);
                            }
                        }
                        catch (err) { }
                        data = {
                            url: url,
                            config: $config,
                            data: result
                        };
                        if (!$config.encoding) {
                            charset = $config.meta && $config.meta.charset;
                            data.data = this.decode(result, charset);
                        }
                        this.emit('complete', data);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1.message !== 'middleware return false' &&
                            config.retry &&
                            config.retry > 0) {
                            this.push(url, __assign({}, config, { retry: config.retry - 1 }));
                            this.emit('error-retry', { url: url, config: config, error: error_1 });
                            return [2 /*return*/];
                        }
                        this.emit('error', { url: url, config: config, error: error_1 });
                        return [3 /*break*/, 6];
                    case 5:
                        if (this.delay && !jump) {
                            setTimeout(function () {
                                _this.complete();
                            }, this.delay);
                        }
                        else {
                            this.complete();
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Http.prototype.appendMiddleware = function (fn) {
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
            charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp);
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
    Http.prototype.complete = function () {
        this.connect--;
        while (this.ifInsert()) {
            var task = this.queue.shift();
            if (task) {
                this.push(task.url, task.config);
            }
            else {
                break;
            }
        }
        if (this.connect === 0 && this.queue.length === 0) {
            this.emit('completeAll');
        }
    };
    return Http;
}(events_1.EventEmitter));
exports.default = Http;
//# sourceMappingURL=http.js.map