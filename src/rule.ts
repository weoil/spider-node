import * as Cheerio from 'cheerio';
import URL from 'url';
import * as IHttp from '../types/http.d';
import * as IRule from '../types/rule.d';
import Spider from './spider';

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
export class Rule {
  public name?: string;
  public rule: RegExp;
  public config: IRule.Config;
  public parse?: IRule.IParse;
  public pipelines: IRule.IPipeline[] = [];
  public error?: IRule.IError;
  constructor(
    name: string = 'rule',
    rule: string | RegExp,
    config: IRule.Config = {
      baseUrl: ''
    },
    parse?: IRule.IParse,
    pipeline?: IRule.IPipeline[] | IRule.IPipeline,
    error?: IRule.IError
  ) {
    this.name = name;
    this.rule = new RegExp(rule);
    this.config = config;
    this.parse = parse;
    if (pipeline) {
      if (Array.isArray(pipeline)) {
        this.pipelines = this.pipelines.concat(pipeline);
      } else {
        this.pipelines.push(pipeline);
      }
    }
    this.error = error;
  }
  public match(url: string, data: string): Set<string> {
    const result: Set<string> = new Set();
    const rule = new RegExp(this.rule, 'g');
    const urls = data.match(rule);
    if (Array.isArray(urls)) {
      urls.forEach((u: string) => {
        const p = this.config.baseUrl ? this.config.baseUrl : url;
        result.add(URL.resolve(p, u));
      });
    }
    return result;
  }
  public test(url: string): boolean {
    return this.rule.test(url);
  }
  public async call(
    url: string,
    data: string | any,
    config: IHttp.Config,
    context: Spider
  ): Promise<any> {
    if (!this.test(url)) {
      return;
    }
    if (!this.parse) {
      return;
    }
    try {
      let item = await this.parse.call(
        context,
        url,
        data,
        Cheerio.load(data),
        config,
        context
      );
      if (!this.pipelines.length) {
        return;
      }
      for (const p of this.pipelines) {
        item = await p.call(context, item, context);
        if (item === false) {
          break;
        }
      }
    } catch (err) {
      this.callError(url, err, config, context);
    }
  }
  public callError(
    url: string,
    error: Error,
    config: IHttp.Config,
    context: Spider
  ): void {
    if (this.error) {
      this.error.call(context, url, error, config, context);
    }
  }
  public isInclude() {
    return this.config.include === false ? false : true;
  }
}
export default Rule;
