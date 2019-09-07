declare namespace Spider {
  type ErrorMiddleware = (
    url: string,
    Error: Error,
    config: Http.Config,
    spider: Spider.ISpider
  ) => void;
  export interface HttpConfig extends Http.Config {
    maxConnect?: number;
    log?: boolean;
    delay?: number;
    repeat?: boolean;
    meta?: {
      [key: string]: any;
    };
  }
  export interface rule {
    name?: string;
    test: string | RegExp;
    config?: Rule.Config;
    parse?: Rule.IParse;
    pipeline?: Rule.IPipeline;
    error?: Rule.IError;
  }

<<<<<<< HEAD
	type urlsFn = () => string | string[] | Set<string>;
	interface PlanConfig {
		urls: string[] | [] | urlsFn;
		time: number;
	}
	export interface Config {
		name?: string;
		rules?: Array<rule>;
		http?: Http.IHttpConstructorConfig;
		plan?: PlanConfig;
		open?: (spider: Spider.ISpider) => Promise<any>;
		close?: (spider: Spider.ISpider) => Promise<any>;
		downloadMiddleware?: [Http.DownloadMiddleware];
		errorMiddleware?: [ErrorMiddleware];
		log?: boolean;
	}
	export interface ISpider {
		config: Config;
		rules: Rule.Rule[];
		http: Http.IHttpConstructorConfig;
		errorMiddlewares: ErrorMiddleware[];
		init(config: Config): void;
		test(
			urls: string[] | string | urlsFn | Set<string>,
			config?: Http.Config
		): any;
		start(
			urls: string[] | string | urlsFn | Set<string>,
			config?: Http.Config
		): any;
		push(
			urls: string[] | string | urlsFn | Set<string>,
			config: Http.IHttpConstructorConfig,
			priority: boolean
		): any;
		rule(
			name: string,
			test: string | RegExp,
			parse: Rule.IParse,
			...args: any[]
		): Promise<any>;
		use(...args: Http.DownloadMiddleware[]): void;
		push(
			urls: string[] | string | Set<string> | urlsFn,
			config: Http.Config,
			priority: boolean
		): void;
		handler(params: {
			url: string;
			data: string | object;
			config: Http.Config;
		}): Promise<any>;
		error(params: { url: string; error: Error; config: Http.Config }): void;
		onCompleteAll(): void;
		getRule(url: string): Rule.Rule;
		initRules(rules: rule[]): void;
	}
=======
  type urlsFn = () => string | string[] | Set<string>;
  interface PlanConfig {
    urls: string[] | [] | urlsFn;
    time: number;
  }
  export interface Config {
    name?: string;
    rules?: Array<rule>;
    http?: HttpConfig;
    plan?: PlanConfig;
    open?: (spider: Spider.ISpider) => Promise<any>;
    close?: (spider: Spider.ISpider) => Promise<any>;
    downloadMiddleware?: [Http.DownloadMiddleware];
    errorMiddleware?: [ErrorMiddleware];
    log?: boolean;
  }
  export interface ISpider {
    config: Config;
    rules: Rule.Rule[];
    http: HttpConfig;
    errorMiddlewares: ErrorMiddleware[];
    init(config: Config): void;
    test(
      urls: string[] | string | urlsFn | Set<string>,
      config?: Http.Config
    ): any;
    start(
      urls: string[] | string | urlsFn | Set<string>,
      config?: Http.Config
    ): any;
    push(
      urls: string[] | string | urlsFn | Set<string>,
      config: Http.Config,
      priority: boolean
    ): any;
    rule(
      name: string,
      test: string | RegExp,
      parse: Rule.IParse,
      ...args: any[]
    ): Promise<any>;
    use(...args: Http.DownloadMiddleware[]): void;
    push(
      urls: string[] | string | Set<string> | urlsFn,
      config: Http.Config,
      priority: boolean
    ): void;
    handler(params: {
      url: string;
      data: string | object;
      config: Http.Config;
    }): Promise<any>;
    error(params: { url: string; error: Error; config: Http.Config }): void;
    onCompleteAll(): void;
    getRuleConfig(url: string): Rule.Config;
    initRules(rules: rule[]): void;
  }
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f
}
