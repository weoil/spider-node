"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function $get(obj, path, defaultValue = null) {
    const paths = path.split('.');
    let val = obj;
    try {
        for (const i of paths) {
            const tmp = val[i];
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
function $call(obj, key, defaultValue = null) {
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
    const rdata = JSON.parse(data);
    return rdata;
}
exports.handlerJSONP = handlerJSONP;
//# sourceMappingURL=index.js.map