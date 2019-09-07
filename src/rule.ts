import { HttpConfig } from './utils/request';
import * as Cheerio from 'cheerio';
import URL from 'url';
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
export class Rule implements Rule.Rule {
<<<<<<< HEAD
	public name?: string;
	public rule: RegExp;
	public config: Rule.Config;
	public parse?: Rule.IParse;
	public pipelines: Rule.IPipeline[] = [];
	public error?: Rule.IError;
	constructor(
		name: string = 'rule',
		rule: string | RegExp,
		config: Rule.Config = {
			baseUrl: '',
		},
		parse?: Rule.IParse,
		pipeline?: Rule.IPipeline[] | Rule.IPipeline,
		error?: Rule.IError
	) {
		this.name = name;
		this.rule = new RegExp(rule);
		if (config.delay) {
			config.maxCollect = 1;
		}
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
		config: HttpConfig,
		context: Spider.ISpider
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
		config: Http.Config,
		context: Spider.ISpider
	): void {
		if (this.error) {
			this.error.call(context, url, error, config, context);
		}
	}
	public isInclude() {
		return this.config.include === false ? false : true;
	}
=======
  public name?: string;
  public rule: RegExp;
  public config: Rule.Config;
  public parse?: Rule.IParse;
  public pipelines: Rule.IPipeline[] = [];
  public error?: Rule.IError;
  constructor(
    name: string = 'rule',
    rule: string | RegExp,
    config: Rule.Config = {
      baseUrl: '',
    },
    parse?: Rule.IParse,
    pipeline?: Rule.IPipeline[] | Rule.IPipeline,
    error?: Rule.IError
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
    config: HttpConfig,
    context: Spider.ISpider
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
    config: Http.Config,
    context: Spider.ISpider
  ): void {
    if (this.error) {
      this.error.call(context, url, error, config, context);
    }
  }
  public isInclude() {
    return this.config.include === false ? false : true;
  }
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f
}
export default Rule;
