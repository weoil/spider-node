interface CrawlConfig {
  maxConnect?: number
}
interface CrawlImp {
  spiders: { [key: string]: SpiderImp }
  isTest: boolean
  runCount: number
  config: CrawlConfig
  middleware: { [key: string]: Array<any> }
  isFirstStart: boolean
  hasPlan: boolean
}
interface SpiderImp {
  config: spiderConfig
  tasklist: Array<string>
  runCount: number
  http: HttpImp
  plan?: planImp
  parseCount: number
}
