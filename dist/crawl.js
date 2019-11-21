"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spider_1 = __importDefault(require("./spider"));
class Crawl {
    static create(config) {
        const s = new spider_1.default(config);
        return s;
    }
}
exports.Crawl = Crawl;
exports.default = Crawl;
//# sourceMappingURL=crawl.js.map