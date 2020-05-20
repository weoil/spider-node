import { IHttp } from '../../types';
import { $get } from '../utils';
import Cache from 'node-cache';

export function Deduplication() {
  const cache = new Cache();
  return async function(
    config: IHttp.HttpMiddlewareConfig
  ): Promise<IHttp.HttpMiddlewareConfig | false> {
    let { url, rule, meta } = config;
    if (meta?.repeat) {
      return config;
    }
    const ttl = meta?.ttl ?? 0;
    let key = $get(rule.rule.exec(url), '1', '');
    key = key && rule.name ? `${rule.name}/${key}` : url;
    if (cache.get(key)) {
      return false;
    }
    cache.set(key, 1, ttl);
    return config;
  };
}

export default Deduplication;
