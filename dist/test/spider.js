"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importDefault(require("../src"));
const s = new src_1.default({
    name: 'test',
    keep: true,
    rules: [
        {
            test: /https:\/\/fac\.newbanker\.cn\/gene\/api\/v1\/mini\/article\/.*\/cache/,
            async parse(url, data, $, config, spider) { },
            error(url, error) { },
        },
    ],
});
s.start([
    `https://fac.newbanker.cn/gene/api/v1/mini/article/2c9380836db00695016dc5f110e11c9b/cache`,
    `https://fac.newbanker.cn/gene/api/v1/mini/article/2c9380836db00695016dc5f110e11c9b/cache`,
]);
//# sourceMappingURL=spider.js.map