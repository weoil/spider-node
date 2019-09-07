interface cacheMapImp {
  date: number;
}
export default async function noRepeat(
  config: Http.MiddlewareConfig
): Promise<Http.MiddlewareConfig | false> {
<<<<<<< HEAD
	if (config.repeat) {
		return config;
	}
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
	const $cacheTime = cacheTime || (rule && rule.config.cacheTime);
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
=======
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
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f
}
