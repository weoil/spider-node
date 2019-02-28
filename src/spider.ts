import { ISpider, NetWork } from '../types/spider'
import Http from './http'
import Rule from './rule'
enum Mode {
  development,
  production,
  test
}

class Spider {
  private config: ISpider.Config
  private rules: Rule[] = []
  private http: Http
  private mode: Mode = Mode.production
  constructor(config: ISpider.Config, http?: Http) {
    this.config = config
    if (http) {
      this.http = Http.clone(http)
    } else {
      this.http = new Http(config.http, config.downloadMiddleware)
    }
    this.initRules(config.rules)
    this.http.on('complete', this.handler.bind(this))
    this.http.on('error', this.error.bind(this))
  }
  public start(urls: string[] | string, config?: NetWork.Config) {
    this.push(urls, config)
  }
  public dev(urls: string[] | string, config?: NetWork.Config) {
    this.mode = Mode.test
    this.start(urls, config)
  }
  public push(
    urls: string[] | string,
    config: NetWork.Config = {},
    priority: boolean = false
  ) {
    let arr: string[] = []
    if (Array.isArray(urls)) {
      arr = arr.concat(urls)
    } else {
      arr.push(urls)
    }
    arr.forEach((url: string) => {
      this.http.push(url, config, priority)
    })
  }
  private async handler(params: {
    url: string
    data: string | object
    config: NetWork.Config
  }): Promise<any> {
    const { url, data, config } = params
    const rules = []
    for (const r of this.rules) {
      if (r.test(url)) {
        rules.push(r)
      }
    }
    let include = true
    rules.forEach(async (r: Rule) => {
      try {
        if (include) {
          include = r.isInclude()
        }
        await r.call(url, data, config, this)
      } catch (error) {
        r.callError(url, error, config, this)
      }
    })
    if (!include || typeof data !== 'string' || this.mode === Mode.test) {
      return
    }
    const urls = this.rules.reduce((set: Set<string>, rule: Rule) => {
      const cs = rule.match(url, data)
      cs.forEach((u: string) => {
        set.add(u)
      })
      return set
    }, new Set<string>())
    urls.forEach((u: string) => {
      this.push(u)
    })
  }
  private error(params: { url: string; error: Error; config: NetWork.Config }) {
    const { url, error, config } = params
    const mids = this.config && this.config.errorMiddleware
    if (mids && mids.length) {
      mids.forEach((fn: ISpider.ErrorMiddleware) => {
        fn.call(this, url, error, config, this)
      })
    }
  }
  private initRules(rules: ISpider.rule[]) {
    rules.forEach((rule: ISpider.rule) => {
      const r = new Rule(
        rule.name,
        rule.test,
        rule.config,
        rule.parse,
        rule.pipeline,
        rule.error
      )
      this.rules.push(r)
    })
  }
}
export default Spider
