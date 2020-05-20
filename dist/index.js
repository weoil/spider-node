"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./crawl"));
__export(require("./http"));
__export(require("./spider"));
__export(require("./utils"));
__export(require("./rule"));
__export(require("./middleware/Deduplication"));
var logger_1 = require("./utils/logger");
exports.createLogger = logger_1.createLogger;
var spider_1 = require("./spider");
exports.default = spider_1.default;
//# sourceMappingURL=index.js.map