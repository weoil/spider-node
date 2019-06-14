"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var spider_1 = __importDefault(require("./spider"));
var Crawl = /** @class */ (function () {
    function Crawl() {
    }
    Crawl.create = function (config) {
        var s = new spider_1.default(config);
        return s;
    };
    return Crawl;
}());
exports.default = Crawl;
//# sourceMappingURL=crawl.js.map