"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Cheerio = __importStar(require("cheerio"));
var url_1 = __importDefault(require("url"));
// interface IRule {
//   name: string
//   rule: RegExp
//   config: IRuleConfig
//   parse: () => any
//   pipeline: () => any
//   match: (data: string) => [string]
//   test: (data: string) => boolean
//   call: (data: string) => any
// }
var Rule = /** @class */ (function () {
    function Rule(name, rule, config, parse, pipeline, error) {
        if (name === void 0) { name = 'rule'; }
        if (config === void 0) { config = {
            baseUrl: '',
        }; }
        this.pipelines = [];
        this.name = name;
        this.rule = new RegExp(rule);
        if (config.delay) {
            config.maxCollect = 1;
        }
        this.config = config;
        this.parse = parse;
        if (pipeline) {
            if (Array.isArray(pipeline)) {
                this.pipelines = this.pipelines.concat(pipeline);
            }
            else {
                this.pipelines.push(pipeline);
            }
        }
        this.error = error;
    }
    Rule.prototype.match = function (url, data) {
        var _this = this;
        var result = new Set();
        var rule = new RegExp(this.rule, 'g');
        var urls = data.match(rule);
        if (Array.isArray(urls)) {
            urls.forEach(function (u) {
                var p = _this.config.baseUrl ? _this.config.baseUrl : url;
                result.add(url_1.default.resolve(p, u));
            });
        }
        return result;
    };
    Rule.prototype.test = function (url) {
        return this.rule.test(url);
    };
    Rule.prototype.call = function (url, data, config, context) {
        return __awaiter(this, void 0, void 0, function () {
            var item, _i, _a, p, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.test(url)) {
                            return [2 /*return*/];
                        }
                        if (!this.parse) {
                            return [2 /*return*/];
                        }
                        config.meta = config.meta || {};
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.parse.call(context, url, data, Cheerio.load(data), config, context)];
                    case 2:
                        item = _b.sent();
                        if (!this.pipelines.length) {
                            return [2 /*return*/];
                        }
                        _i = 0, _a = this.pipelines;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        p = _a[_i];
                        return [4 /*yield*/, p.call(context, item, context)];
                    case 4:
                        item = _b.sent();
                        if (item === false) {
                            return [3 /*break*/, 6];
                        }
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_1 = _b.sent();
                        this.callError(url, err_1, config, context);
                        throw err_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Rule.prototype.callError = function (url, error, config, context) {
        if (this.error) {
            this.error.call(context, url, error, config, context);
        }
    };
    Rule.prototype.isInclude = function () {
        // undefind情况下为true
        return this.config.include === false ? false : true;
    };
    return Rule;
}());
exports.Rule = Rule;
function createRule(rule) {
    if (!Array.isArray(rule)) {
        rule = [rule];
    }
    return rule;
}
exports.createRule = createRule;
exports.default = Rule;
//# sourceMappingURL=rule.js.map