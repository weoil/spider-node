import request from 'request';
export interface CoreOptions extends request.CoreOptions {}
export interface HttpConfig extends CoreOptions {
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
