import { NetWork } from '../../types/spider'
export default function noRepeat(
  config: NetWork.Config
): NetWork.Config | false {
  let list: Set<string>
  if (!config.$system) {
    config.$system = {}
  }
  if (config.$system.overlist) {
    list = config.$system.overlist
  } else {
    list = config.$system.overlist = new Set<string>()
  }
  if (typeof config.url !== 'string' || list.has(config.url)) {
    return false
  }
  list.add(config.url)
  return config
}
