declare namespace Rule {
<<<<<<< HEAD
	interface RuleHttpConfig extends Http.Config {}
	export interface Config {
		baseUrl?: string;
		include?: boolean;
		http?: RuleHttpConfig;
		charset?: string;
		maxCollect?: number;
		delay?: number;
		[key: string]: any;
	}
	type IError = Spider.ErrorMiddleware;
	type IParse = (
		url: string,
		data: string | any,
		selector: CheerioSelector,
		config: Http.Config,
		spider: Spider.ISpider
	) => any;
	type IPipeline = (item?: any, spider?: Spider.ISpider) => any;
=======
  interface RuleHttpConfig extends Http.Config {}
  export interface Config {
    baseUrl?: string;
    include?: boolean;
    http?: RuleHttpConfig;
    charset?: string;
    [key: string]: any;
  }
  type IError = Spider.ErrorMiddleware;
  type IParse = (
    url: string,
    data: string | any,
    selector: CheerioSelector,
    config: Http.Config,
    spider: Spider.ISpider
  ) => any;
  type IPipeline = (item?: any, spider?: Spider.ISpider) => any;
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f

  export interface Rule {
    name?: string;
    rule: RegExp;
    config: Config;
    parse?: IParse;
    pipelines: IPipeline[];
    error?: IError;
    match(url: string, data: string): Set<string>;
    test(url: string): boolean;
    call(
      url: string,
      data: string | any,
      config: Http.Config,
      context: Spider.ISpider
    ): Promise<any>;
    callError(
      url: string,
      error: Error,
      config: Http.Config,
      context: Spider.ISpider
    ): void;
    isInclude(): boolean;
  }
}
