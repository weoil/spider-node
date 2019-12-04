"use strict";
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
const Cheerio = __importStar(require("cheerio"));
const url_1 = __importDefault(require("url"));
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
class Rule {
    constructor(name = 'rule', rule, config = {
        baseUrl: '',
    }, parse, pipeline, error) {
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
    match(url, data) {
        const result = new Set();
        const rule = new RegExp(this.rule, 'g');
        const urls = data.match(rule);
        if (Array.isArray(urls)) {
            urls.forEach((u) => {
                const p = this.config.baseUrl ? this.config.baseUrl : url;
                result.add(url_1.default.resolve(p, u));
            });
        }
        return result;
    }
    test(url) {
        return this.rule.test(url);
    }
    async call(url, data, config, context) {
        if (!this.test(url)) {
            return;
        }
        if (!this.parse) {
            return;
        }
        config.meta = config.meta || {};
        try {
            let item = await this.parse.call(context, url, data, Cheerio.load(data), config, context);
            if (!this.pipelines.length) {
                return;
            }
            for (const p of this.pipelines) {
                item = await p.call(context, item, context);
                if (item === false) {
                    break;
                }
            }
        }
        catch (err) {
            this.callError(url, err, config, context);
            throw err;
        }
    }
    callError(url, error, config, context) {
        if (this.error) {
            this.error.call(context, url, error, config, context);
        }
    }
    isInclude() {
        // undefind情况下为true
        return this.config.include === false ? false : true;
    }
}
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