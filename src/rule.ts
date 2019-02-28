import Spider from '@/spider'
import { IRule, NetWork } from '@@/types/spider'
import * as Cheerio from 'cheerio'
import URL from 'url'

// interface IRule {
//   name: string
//   rule: RegExp
//   config: IRuleConfig
//   parse: () => any
//   pipeline: () => any
//   match: (data: string) => [string]
//   test: (data: string) => boolean
//   call: (data: string) => any
// }
class Rule {
  public name?: string
  public rule: RegExp
  public config: IRule.IRuleConfig
  public parse?: IRule.IParse
  public pipeline?: IRule.IPipeline
  public error?: IRule.IError
  constructor(
    name: string = 'rule',
    rule: string | RegExp,
    config: IRule.IRuleConfig = {
      baseUrl: ''
    },
    parse?: IRule.IParse,
    pipeline?: IRule.IPipeline,
    error?: IRule.IError
  ) {
    this.name = name
    this.rule = new RegExp(rule)
    this.config = config
    this.parse = parse
    this.pipeline = pipeline
    this.error = error
  }
  public match(url: string, data: string): Set<string> {
    const result: Set<string> = new Set()
    const rule = new RegExp(this.rule, 'g')
    const urls = data.match(rule)
    if (Array.isArray(urls)) {
      urls.forEach((u: string) => {
        const p = this.config.baseUrl ? this.config.baseUrl : url
        result.add(URL.resolve(p, u))
      })
    }
    return result
  }
  public test(url: string): boolean {
    return this.rule.test(url)
  }
  public async call(
    url: string,
    data: string | object,
    config: NetWork.Config,
    context: Spider
  ): Promise<any> {
    if (!this.test(url)) {
      return
    }
    if (!this.parse) {
      return
    }
    const item = await this.parse.call(
      context,
      url,
      data,
      typeof data === 'string' ? Cheerio.load(data) : null,
      config,
      context
    )
    if (!this.pipeline) {
      return
    }
    await this.pipeline.call(context, item, context)
  }
  public callError(
    url: string,
    error: Error,
    config: NetWork.Config,
    context: Spider
  ): void {
    if (this.error) {
      this.error.call(context, url, error, config, context)
    }
  }
  public isInclude() {
    return this.config.include === false ? false : true
  }
}
export default Rule
