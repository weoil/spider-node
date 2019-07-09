import {Http} from '../../types/http.d';
interface cacheMapImp {
  date: number;
}
export default async function noRepeat(
  config: Http.MiddlewareConfig
): Promise<Http.MiddlewareConfig | false> {
  let { url, overlist, cacheMap, rule, rootConfig, cacheTime } = config;
  if (!overlist) {
    rootConfig.overlist = config.overlist = overlist = new Set();
  }
  if (!cacheMap) {
    rootConfig.cacheMap = config.cacheMap = cacheMap = new Map<
      string,
      cacheMapImp
    >();
  }
  const $cacheTime = cacheTime || (rule && rule.cacheTime);
  if ($cacheTime) {
    const $cache = cacheMap.get(url);
    if ($cache && Date.now() - $cache.date >= $cacheTime) {
      $cache.date = Date.now();
      return config;
    } else if (!$cache && !overlist.has(url)) {
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
