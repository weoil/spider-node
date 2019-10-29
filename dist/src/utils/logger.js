"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = __importDefault(require("log4js"));
log4js_1.default.configure({
    appenders: {
        console: {
            type: 'console',
        },
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'info',
        },
    },
});
function createLogger(name, status = true) {
    const log = log4js_1.default.getLogger(name);
    log.addContext('logName', name);
    if (!status) {
        log.level = 'off';
    }
    return log;
}
exports.createLogger = createLogger;
exports.default = log4js_1.default;
//# sourceMappingURL=logger.js.map