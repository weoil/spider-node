import { NetWork } from '../../types/spider'
export default function noRepeat(
  config: NetWork.MiddlewareConfig
): NetWork.MiddlewareConfig | false {
  let list: Map<string, any>
  if (!config.$system) {
    config.$system = {}
  }
  let vl = config.$system.overlist
  if (vl && vl instanceof Map) {
    list = vl
  } else if (vl.forEach) {
    list = new Map<string, any>()
    vl.forEach((u: string) => {
      list.set(u, {})
    })
  } else {
    list = vl = new Map<string, any>()
  }
  const url = config.url
  if (typeof url !== 'string') {
    return false
  }
  if (config.$rule && config.$rule.expire) {
    const expire = config.$rule.expire
    // 存在缓存时间
    const val = list.get(url)
    if (val && val.time) {
      // 如果存在值 and 有上次的时间
      if (val.time + expire > Date.now()) {
        // 如果上次的时间超时
        val.time = Date.now()
        return config
      } else {
        return false
      }
    } else {
      // 没有值的话为第一次使用 第一次时候赋值
      list.set(url, { time: Date.now() })
      return config
    }
  }
  list.set(url, {})
  return config
}
