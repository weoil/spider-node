import Http from '@/http'
import Rule from '@/rule'
import { IRule, ISpider, NetWork } from '@@/types/spider'
import { EventEmitter } from 'events'
enum Mode {
  development,
  production,
  test
}
// type RuleCbErrorCb = ((err: Error) => void) | null
// class RuleCb {
//   private ecb: RuleCbErrorCb = null
//   public register(cb: RuleCbErrorCb) {
//     this.ecb = cb
//   }
//   public take(error: Error) {
//     if (typeof this.ecb === 'function') {
//       this.ecb(error)
//     }
//   }
// }

class Spider extends EventEmitter {
  public static new(config: ISpider.Config) {
    return new Spider(config)
  }
  private config: ISpider.Config = {
    name: 'spider'
  }
  private rules: Rule[] = []
  private http: Http
  private mode: Mode = Mode.production
  private errorMiddlewares: ISpider.ErrorMiddleware[] = []
  constructor(config: ISpider.Config, http?: Http) {
    super()
    this.config = { ...this.config, ...config }
    if (http) {
      this.http = Http.clone(http)
    } else {
      this.http = new Http(config.http, config.downloadMiddleware)
    }
    this.init(this.config)
  }
  public init(config: ISpider.Config) {
    if (config.rules) {
      this.initRules(config.rules)
    }
    if (config.errorMiddleware) {
      this.errorMiddlewares = this.errorMiddlewares.concat(
        config.errorMiddleware
      )
    }
    this.http.on('complete', this.handler.bind(this))
    this.http.on('error', this.error.bind(this))
    this.http.on('completeAll', this.onCompleteAll.bind(this))
  }
  public async start(urls: string[] | string, config?: NetWork.Config) {
    if (this.config.open && typeof this.config.open === 'function') {
      await this.config.open.call(this, this)
    }
    this.push(urls, config)
  }
  public test(urls: string[] | string, config?: NetWork.Config) {
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
      const ruleConfig = this.getRuleConfig(url)
      this.http.push(url, { ...config, ...ruleConfig }, priority)
    })
  }
  public rule(
    name: string,
    test: string | RegExp,
    parse: IRule.IParse,
    ...args: any[]
  ): Promise<any> {
    let config: IRule.IRuleConfig = {}
    const c = args[args.length - 1]
    if (typeof c === 'object') {
      config = c
      args.pop()
    }
    let rej: any
    const p = new Promise((resolve, reject) => {
      rej = reject
    })
    const rule = new Rule(
      name,
      test,
      config,
      parse,
      args,
      (url: string, err: Error, cfg: IRule.IRuleConfig) => {
        rej(url, err, cfg, this)
      }
    )
    this.rules.push(rule)
    return p
  }
  public use(...args: ISpider.DownloadMiddleware[]): void {
    this.http.appendMiddleware(args)
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
    this.errorMiddlewares.forEach((fn: ISpider.ErrorMiddleware) => {
      fn.call(this, url, error, config, this)
    })
  }
  private onCompleteAll() {
    if (this.config.close && typeof this.config.close === 'function') {
      this.config.close.call(this, this)
    }
  }
  private getRuleConfig(url: string) {
    const methods = ['expire']
    const result: NetWork.Config = this.rules.reduce(
      (config: { [key: string]: any }, rule) => {
        if (rule.test(url)) {
          methods.forEach((key: string) => {
            if (rule.config[key]) {
              if (!config.$rule) {
                config.$rule = {}
              }
              config.$rule[key] = rule.config[key]
            }
          })
          if (rule.config.http) {
            config = { ...config, ...rule.config.http }
          }
        }
        return config
      },
      {}
    )
    return result
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
