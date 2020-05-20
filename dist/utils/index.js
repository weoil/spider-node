"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function $get(obj, path, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    var paths = path.split('.');
    var val = obj;
    try {
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var i = paths_1[_i];
            var tmp = val[i];
            if (tmp) {
                val = tmp;
            }
            else {
                throw new Error();
            }
        }
        return val;
    }
    catch (err) {
        return defaultValue;
    }
}
exports.$get = $get;
function $call(obj, key, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    if (obj && obj[key] && typeof obj[key] === 'function') {
        return obj[key]();
    }
    return defaultValue;
}
exports.$call = $call;
function handlerJSONP(data) {
    data
        .replace(/\\"/g, '"')
        .replace(/"\{/g, '{')
        .replace(/\}"/g, '}')
        .replace(/"\[/g, '[')
        .replace(/\]"/g, ']');
    // console.log(data)
    var rdata = JSON.parse(data);
    return rdata;
}
exports.handlerJSONP = handlerJSONP;
//# sourceMappingURL=index.js.map