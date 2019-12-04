"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function Deduplication(config) {
    if (config.repeat) {
        return config;
    }
    let { url, overlist, cacheMap, rule, rootConfig, cacheTime } = config;
    const $cacheTime = cacheTime || (rule && rule.config.cacheTime);
    if (rootConfig.redis) {
        const redis = rootConfig.redis;
        let mKey = `${rootConfig.spider
            ? rootConfig.spider.config.name || 'spider-node'
            : 'spider-node'}-${rule.name || rule.rule}`;
        // console.log(mKey);
        const date = await redis.hgetAsync(`${mKey}`, url);
        // console.log(`date:${date}`);
        if (date === '1') {
            // 不超时
            return false;
        }
        if (!date) {
            // 没有记录
            await redis.hsetAsync(`${mKey}`, url, $cacheTime ? Date.now() : '1');
            return config;
        }
        if (Date.now() > Number(date) + $cacheTime) {
            // 已超时
            await redis.hsetAsync(`${mKey}`, url, Date.now());
            return config;
        }
        return config;
    }
    if (!overlist) {
        rootConfig.overlist = config.overlist = overlist = new Set();
    }
    if (!cacheMap) {
        rootConfig.cacheMap = config.cacheMap = cacheMap = new Map();
    }
    if ($cacheTime) {
        const $cache = cacheMap.get(url);
        if ($cache && Date.now() - $cache.date >= $cacheTime) {
            $cache.date = Date.now();
            return config;
        }
        else if (!$cache && !overlist.has(url)) {
            overlist.add(url);
            cacheMap.set(url, { date: Date.now() });
            return config;
        }
        return false;
    }
    if (overlist.has(url)) {
        return false;
    }
    return config;
}
exports.Deduplication = Deduplication;
exports.default = Deduplication;
//# sourceMappingURL=Deduplication.js.map