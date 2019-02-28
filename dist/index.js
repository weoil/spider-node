/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test/d1.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/crawl.ts":
/*!**********************!*\
  !*** ./src/crawl.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst spider_1 = __importDefault(__webpack_require__(/*! ./spider */ \"./src/spider.ts\"));\r\nclass Crawl {\r\n    static create(config) {\r\n        const s = new spider_1.default(config);\r\n        return s;\r\n    }\r\n}\r\nexports.default = Crawl;\r\n\n\n//# sourceURL=webpack:///./src/crawl.ts?");

/***/ }),

/***/ "./src/http.ts":
/*!*********************!*\
  !*** ./src/http.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __importStar = (this && this.__importStar) || function (mod) {\r\n    if (mod && mod.__esModule) return mod;\r\n    var result = {};\r\n    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];\r\n    result[\"default\"] = mod;\r\n    return result;\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst events_1 = __webpack_require__(/*! events */ \"events\");\r\nconst iconv = __importStar(__webpack_require__(/*! iconv-lite */ \"iconv-lite\"));\r\nconst request_promise_1 = __importDefault(__webpack_require__(/*! request-promise */ \"request-promise\"));\r\nconst repeat_1 = __importDefault(__webpack_require__(/*! ./middleware/repeat */ \"./src/middleware/repeat.ts\"));\r\nclass Http extends events_1.EventEmitter {\r\n    constructor(config = {\r\n        repeat: false\r\n    }, middlewares) {\r\n        super();\r\n        this.delay = 0;\r\n        this.overlist = new Set();\r\n        this.maxConnect = Infinity;\r\n        this.connect = 0;\r\n        this.middlewares = [];\r\n        this.timer = null;\r\n        this.baseConfig = {};\r\n        this.$system = {};\r\n        this.queue = [];\r\n        const cfg = (this.baseConfig = Object.assign({}, this.baseConfig, config));\r\n        if (cfg.maxConnect) {\r\n            this.maxConnect = cfg.maxConnect;\r\n            delete cfg.maxConnect;\r\n        }\r\n        if (cfg.delay) {\r\n            this.maxConnect = 1;\r\n            this.delay = cfg.delay;\r\n            delete cfg.delay;\r\n        }\r\n        if (!cfg.repeat) {\r\n            this.middlewares.push(repeat_1.default);\r\n            delete cfg.repeat;\r\n        }\r\n        if (cfg.$system) {\r\n            this.$system = cfg.$system;\r\n            delete cfg.$system;\r\n        }\r\n        if (middlewares) {\r\n            this.middlewares = [...this.middlewares, ...middlewares];\r\n        }\r\n    }\r\n    static clone(http) {\r\n        return new Http(http.baseConfig, http.middlewares);\r\n    }\r\n    ifInsert() {\r\n        // console.log(this.connect, this.maxConnect, this.queue.length)\r\n        if (this.connect < this.maxConnect) {\r\n            return true;\r\n        }\r\n        return false;\r\n    }\r\n    push(url, config = {}, priority = false) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            if (this.ifInsert()) {\r\n                this.run(url, config);\r\n                return;\r\n            }\r\n            const queue = this.queue;\r\n            if (priority) {\r\n                queue.unshift({ url, config });\r\n            }\r\n            else {\r\n                queue.push({ url, config });\r\n            }\r\n        });\r\n    }\r\n    run(url, config = {}) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            this.connect++;\r\n            try {\r\n                config = Object.assign({ jar: false, encoding: null }, this.baseConfig, config);\r\n                const $config = this.callMiddleware(Object.assign({ url }, config, { $system: this.$system }));\r\n                if ($config === false) {\r\n                    throw new Error('middleware return false');\r\n                }\r\n                const result = yield request_promise_1.default(url, $config);\r\n                const data = {\r\n                    url,\r\n                    config,\r\n                    data: result\r\n                };\r\n                if (!config.encoding) {\r\n                    const charset = config.meta && config.meta.charset;\r\n                    data.data = this.decode(result, charset);\r\n                }\r\n                this.emit('complete', data);\r\n            }\r\n            catch (error) {\r\n                this.emit('error', { url, config, error });\r\n            }\r\n            finally {\r\n                if (this.delay) {\r\n                    this.timer = setTimeout(() => {\r\n                        if (this.timer) {\r\n                            clearTimeout(this.timer);\r\n                            this.timer = null;\r\n                        }\r\n                        this.complete();\r\n                    }, this.delay);\r\n                }\r\n                else {\r\n                    this.complete();\r\n                }\r\n            }\r\n        });\r\n    }\r\n    callMiddleware(config) {\r\n        let c = Object.assign({}, config);\r\n        for (const fn of this.middlewares) {\r\n            c = fn(c);\r\n            if (c === false) {\r\n                break;\r\n            }\r\n        }\r\n        return c;\r\n    }\r\n    decode(buffer, charset) {\r\n        if (charset) {\r\n            return iconv.decode(buffer, charset);\r\n        }\r\n        const tmp = iconv.decode(buffer, 'utf8');\r\n        try {\r\n            charset = /charset\\=[^\"].*\"|charset\\=\"[^\"].*\"/.exec(tmp);\r\n            charset = charset\r\n                .replace('charset=', '')\r\n                .replace(/\"/g, '')\r\n                .replace('-', '')\r\n                .trim();\r\n        }\r\n        catch (e) {\r\n            charset = 'utf8';\r\n        }\r\n        if (charset.toLowerCase() === 'utf8') {\r\n            return tmp;\r\n        }\r\n        return iconv.decode(buffer, charset);\r\n    }\r\n    complete() {\r\n        this.connect--;\r\n        while (this.ifInsert()) {\r\n            const task = this.queue.shift();\r\n            if (task) {\r\n                this.push(task.url, task.config);\r\n            }\r\n            else {\r\n                break;\r\n            }\r\n        }\r\n    }\r\n}\r\nexports.default = Http;\r\n\n\n//# sourceURL=webpack:///./src/http.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst crawl_1 = __importDefault(__webpack_require__(/*! ./crawl */ \"./src/crawl.ts\"));\r\nconst http_1 = __importDefault(__webpack_require__(/*! ./http */ \"./src/http.ts\"));\r\nconst spider_1 = __importDefault(__webpack_require__(/*! ./spider */ \"./src/spider.ts\"));\r\nexports.Crawl = crawl_1.default;\r\nexports.Http = http_1.default;\r\nexports.Spider = spider_1.default;\r\nexports.default = exports.Crawl;\r\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ }),

/***/ "./src/middleware/repeat.ts":
/*!**********************************!*\
  !*** ./src/middleware/repeat.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nfunction noRepeat(config) {\r\n    let list;\r\n    if (!config.$system) {\r\n        config.$system = {};\r\n    }\r\n    if (config.$system.overlist) {\r\n        list = config.$system.overlist;\r\n    }\r\n    else {\r\n        list = config.$system.overlist = new Set();\r\n    }\r\n    if (typeof config.url !== 'string' || list.has(config.url)) {\r\n        return false;\r\n    }\r\n    list.add(config.url);\r\n    return config;\r\n}\r\nexports.default = noRepeat;\r\n\n\n//# sourceURL=webpack:///./src/middleware/repeat.ts?");

/***/ }),

/***/ "./src/rule.ts":
/*!*********************!*\
  !*** ./src/rule.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __importStar = (this && this.__importStar) || function (mod) {\r\n    if (mod && mod.__esModule) return mod;\r\n    var result = {};\r\n    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];\r\n    result[\"default\"] = mod;\r\n    return result;\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst Cheerio = __importStar(__webpack_require__(/*! cheerio */ \"cheerio\"));\r\nconst url_1 = __importDefault(__webpack_require__(/*! url */ \"url\"));\r\n// interface IRule {\r\n//   name: string\r\n//   rule: RegExp\r\n//   config: IRuleConfig\r\n//   parse: () => any\r\n//   pipeline: () => any\r\n//   match: (data: string) => [string]\r\n//   test: (data: string) => boolean\r\n//   call: (data: string) => any\r\n// }\r\nclass Rule {\r\n    constructor(name = 'rule', rule, config = {\r\n        baseUrl: ''\r\n    }, parse, pipeline, error) {\r\n        this.name = name;\r\n        this.rule = new RegExp(rule);\r\n        this.config = config;\r\n        this.parse = parse;\r\n        this.pipeline = pipeline;\r\n        this.error = error;\r\n    }\r\n    match(url, data) {\r\n        const result = new Set();\r\n        const rule = new RegExp(this.rule, 'g');\r\n        const urls = data.match(rule);\r\n        if (Array.isArray(urls)) {\r\n            urls.forEach((u) => {\r\n                const p = this.config.baseUrl ? this.config.baseUrl : url;\r\n                result.add(url_1.default.resolve(p, u));\r\n            });\r\n        }\r\n        return result;\r\n    }\r\n    test(url) {\r\n        return this.rule.test(url);\r\n    }\r\n    call(url, data, config, context) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            if (!this.test(url)) {\r\n                return;\r\n            }\r\n            if (!this.parse) {\r\n                return;\r\n            }\r\n            const item = yield this.parse.call(context, url, data, typeof data === 'string' ? Cheerio.load(data) : null, config, context);\r\n            if (!this.pipeline) {\r\n                return;\r\n            }\r\n            yield this.pipeline.call(context, item, context);\r\n        });\r\n    }\r\n    callError(url, error, config, context) {\r\n        if (this.error) {\r\n            this.error.call(context, url, error, config, context);\r\n        }\r\n    }\r\n    isInclude() {\r\n        return this.config.include === false ? false : true;\r\n    }\r\n}\r\nexports.default = Rule;\r\n\n\n//# sourceURL=webpack:///./src/rule.ts?");

/***/ }),

/***/ "./src/spider.ts":
/*!***********************!*\
  !*** ./src/spider.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst http_1 = __importDefault(__webpack_require__(/*! ./http */ \"./src/http.ts\"));\r\nconst rule_1 = __importDefault(__webpack_require__(/*! ./rule */ \"./src/rule.ts\"));\r\nvar Mode;\r\n(function (Mode) {\r\n    Mode[Mode[\"development\"] = 0] = \"development\";\r\n    Mode[Mode[\"production\"] = 1] = \"production\";\r\n    Mode[Mode[\"test\"] = 2] = \"test\";\r\n})(Mode || (Mode = {}));\r\nclass Spider {\r\n    constructor(config, http) {\r\n        this.rules = [];\r\n        this.mode = Mode.production;\r\n        this.config = config;\r\n        if (http) {\r\n            this.http = http_1.default.clone(http);\r\n        }\r\n        else {\r\n            this.http = new http_1.default(config.http, config.downloadMiddleware);\r\n        }\r\n        this.initRules(config.rules);\r\n        this.http.on('complete', this.handler.bind(this));\r\n        this.http.on('error', this.error.bind(this));\r\n    }\r\n    start(urls, config) {\r\n        this.push(urls, config);\r\n    }\r\n    dev(urls, config) {\r\n        this.mode = Mode.test;\r\n        this.start(urls, config);\r\n    }\r\n    push(urls, config = {}, priority = false) {\r\n        let arr = [];\r\n        if (Array.isArray(urls)) {\r\n            arr = arr.concat(urls);\r\n        }\r\n        else {\r\n            arr.push(urls);\r\n        }\r\n        arr.forEach((url) => {\r\n            this.http.push(url, config, priority);\r\n        });\r\n    }\r\n    handler(params) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const { url, data, config } = params;\r\n            const rules = [];\r\n            for (const r of this.rules) {\r\n                if (r.test(url)) {\r\n                    rules.push(r);\r\n                }\r\n            }\r\n            let include = true;\r\n            rules.forEach((r) => __awaiter(this, void 0, void 0, function* () {\r\n                try {\r\n                    if (include) {\r\n                        include = r.isInclude();\r\n                    }\r\n                    yield r.call(url, data, config, this);\r\n                }\r\n                catch (error) {\r\n                    r.callError(url, error, config, this);\r\n                }\r\n            }));\r\n            if (!include || typeof data !== 'string' || this.mode === Mode.test) {\r\n                return;\r\n            }\r\n            const urls = this.rules.reduce((set, rule) => {\r\n                const cs = rule.match(url, data);\r\n                cs.forEach((u) => {\r\n                    set.add(u);\r\n                });\r\n                return set;\r\n            }, new Set());\r\n            console.log('url,match', url, urls.size);\r\n            urls.forEach((u) => {\r\n                this.push(u);\r\n            });\r\n        });\r\n    }\r\n    error(params) {\r\n        const { url, error, config } = params;\r\n        const mids = this.config && this.config.errorMiddleware;\r\n        if (mids && mids.length) {\r\n            mids.forEach((fn) => {\r\n                fn.call(this, url, error, config, this);\r\n            });\r\n        }\r\n    }\r\n    initRules(rules) {\r\n        rules.forEach((rule) => {\r\n            const r = new rule_1.default(rule.name, rule.test, rule.config, rule.parse, rule.pipeline, rule.error);\r\n            this.rules.push(r);\r\n        });\r\n    }\r\n}\r\nexports.default = Spider;\r\n\n\n//# sourceURL=webpack:///./src/spider.ts?");

/***/ }),

/***/ "./test/d1.ts":
/*!********************!*\
  !*** ./test/d1.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst index_1 = __webpack_require__(/*! ../src/index */ \"./src/index.ts\");\r\nconst testConfig = {};\r\nconst spider = new index_1.Spider({\r\n    name: 'mdn',\r\n    http: {\r\n        delay: 5000,\r\n        meta: {\r\n            a: 1\r\n        }\r\n    },\r\n    rules: [\r\n        {\r\n            test: /\\/zh-CN\\/docs\\/[^\"']*/,\r\n            parse(url, data, $, c, _) {\r\n                console.log('23333', url, c);\r\n                if (c.meta.a) {\r\n                    c.meta.a += 1;\r\n                }\r\n            },\r\n            error(url, error, c, s) {\r\n                console.log('error', url);\r\n            }\r\n        }\r\n    ]\r\n});\r\nspider.start('https://developer.mozilla.org/zh-CN');\r\n\n\n//# sourceURL=webpack:///./test/d1.ts?");

/***/ }),

/***/ "cheerio":
/*!**************************!*\
  !*** external "cheerio" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cheerio\");\n\n//# sourceURL=webpack:///external_%22cheerio%22?");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"events\");\n\n//# sourceURL=webpack:///external_%22events%22?");

/***/ }),

/***/ "iconv-lite":
/*!*****************************!*\
  !*** external "iconv-lite" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"iconv-lite\");\n\n//# sourceURL=webpack:///external_%22iconv-lite%22?");

/***/ }),

/***/ "request-promise":
/*!**********************************!*\
  !*** external "request-promise" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"request-promise\");\n\n//# sourceURL=webpack:///external_%22request-promise%22?");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"url\");\n\n//# sourceURL=webpack:///external_%22url%22?");

/***/ })

/******/ });