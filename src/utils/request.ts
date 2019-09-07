import request from 'request';
export interface CoreOptions extends request.CoreOptions {}

export interface HttpConfig extends CoreOptions {
<<<<<<< HEAD
	name?: string;
	url?: string;
	retry?: number;
	meta?: {
		[key: string]: any;
	};
	charset?: string;
	rule: Rule.Rule;
	cacheTime?: number;
	overlist?: Set<string>;
	[key: string]: any;
=======
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
>>>>>>> 459e0e5e3b09a16ae8cc8e516cfe7bc0f866f73f
}
