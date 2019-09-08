declare namespace Http {
<<<<<<< HEAD
	export interface HttpRuleConfig extends Rule.Config {
		rule: Rule.Rule;
	}
	export interface IHttpConstructorConfig {
		name?: string;
		url?: string;
		retry?: number;
		meta?: {
			[key: string]: any;
		};
		charset?: string;
		cacheTime?: number;
		overlist?: Set<string>;
		[key: string]: any;
		repeat?: boolean;
	}
	export interface Config extends IHttpConstructorConfig {
		rule: Rule.Rule;
	}
	export interface MiddlewareConfig extends Config {
		url: string;
		rootConfig: IHttpConstructorConfig;
	}
	export interface Result {
		url: string;
		data: any;
		config: Config;
	}
	type DownloadMiddleware = (
		config: MiddlewareConfig
	) => Promise<MiddlewareConfig | false>;
	export interface IHttp {
		maxConnect: number;
		connect: number;
		middlewares: Array<DownloadMiddleware>;
		config: IHttpConstructorConfig;
		inspect(url: string, config: Config): boolean;
		run(url: string, config: Config): Promise<Result>;
		callMiddleware(config: Config): Promise<Http.MiddlewareConfig | false>;
	}
=======
  export interface Config {
    name?: string;
    url?: string;
    retry?: number;
    meta?: {
      [key: string]: any;
    };
    charset?: string;
    rule?: Rule.Config;
    cacheTime?: number;
    overlist?: Set<string>;
    [key: string]: any;
  }
  export interface MiddlewareConfig extends Config {
    url: string;
    rootConfig: Config;
  }
  export interface Result {
    url: string;
    data: any;
    config: Config;
  }
  type DownloadMiddleware = (
    config: MiddlewareConfig
  ) => Promise<MiddlewareConfig | false>;
  export interface IHttp {
    maxConnect: number;
    connect: number;
    middlewares: Array<DownloadMiddleware>;
    config: Config;
    inspect(): boolean;
    run(url: string, config: Config): Promise<Result>;
    callMiddleware(config: Config): Config | false;
  }
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f

  export interface IFetch {
    request(url: string, config: any): Promise<any>;
  }
}
