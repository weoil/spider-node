import { HttpConfig } from './utils/request';
import { EventEmitter } from 'events';
import iconv from 'iconv-lite';
import { Logger } from 'log4js';
import rp from 'request-promise';
import NoRepeatMid from './middleware/repeat';
import { createLogger } from './utils/logger';
interface IHttpTask {
	url: string;
	config: Http.Config;
}

export class Http extends EventEmitter implements Http.IHttp, Http.IFetch {
	public static clone(http: Http): Http {
		return new Http(http.config, http.middlewares);
	}
	public logger: Logger;
	public delay: number = 0;
	public maxConnect: number = Infinity;
	public connect: number = 0;
	public middlewares: Http.DownloadMiddleware[] = [];
	public timer: NodeJS.Timeout | null = null;
	public config: HttpConfig = {
		overlist: new Set(),
		cacheMap: new Map(),
	};
	private queue: IHttpTask[] = [];
	constructor(
		config: HttpConfig = {
			repeat: false,
		},
		middlewares?: Http.DownloadMiddleware[]
	) {
		super();
		this.logger = createLogger(config.name || 'spider', config.log);
		const cfg = (this.config = { ...this.config, ...config });
		if (cfg.maxConnect) {
			this.maxConnect = cfg.maxConnect;
			delete cfg.maxConnect;
		}
		if (cfg.delay) {
			this.maxConnect = 1;
			this.delay = cfg.delay;
			delete cfg.delay;
		}
		if (!cfg.repeat) {
			this.middlewares.push(NoRepeatMid);
			delete cfg.repeat;
		}
		if (middlewares) {
			this.middlewares = [...this.middlewares, ...middlewares];
		}
	}
	public async request(url: string, config: HttpConfig) {
		const tmp: any = config;
		const result = await rp({
			url,
			...tmp,
		});
		return result;
	}
	public inspect(): boolean {
		// console.log(this.connect, this.maxConnect, this.queue.length)
		if (this.connect < this.maxConnect) {
			return true;
		}
		return false;
	}
	public async push(
		url: string,
		config: HttpConfig = {},
		priority: boolean = false
	): Promise<any> {
		if (this.inspect()) {
			this.run(url, config);
			return;
		}
		this.logger.info(`任务加入队列:${url}`);
		const queue = this.queue;
		if (priority) {
			queue.unshift({ url, config });
		} else {
			queue.push({ url, config });
		}
	}
	public addOverUrl(url: string) {
		if (!this.config.overlist) {
			this.config.overlist = new Set<string>();
		}
		this.config.overlist.add(url);
	}
	public async run(url: string, config: HttpConfig = {}): Promise<any> {
		this.connect++;
		this.logger.info(`正在进行请求,目前请求数量:${this.connect}:url:${url}`);
		let jump = false;
		try {
			const $config: HttpConfig | false = await this.callMiddleware({
				url,
				...this.config,
				...config,
				rootConfig: this.config,
			});
			if ($config === false) {
				this.logger.info(`网络处理中间件阻止继续执:${url}`);
				jump = true;
				throw new Error('middleware return false');
			}
			let result = await this.request(url, {
				jar: false,
				encoding: null,
				...$config,
			});

			const data: Http.Result = {
				url,
				config: $config,
				data: result,
			};
			if (!$config.encoding) {
				const charset =
					$config.charset || ($config.rule && $config.rule.charset);
				data.data = this.decode(result, charset);
			}
			try {
				if (typeof data.data === 'string' && /^(\{|\[)/.test(data.data)) {
					data.data = JSON.parse(data.data);
				}
			} catch (_) {
				// try
			}
			this.logger.info(`网络请求完成:${url}`);
			this.emit('complete', data);
		} catch (error) {
			if (error.message !== 'middleware return false' && config.retry) {
				this.push(url, { ...config, retry: config.retry - 1 });
				this.emit('error-retry', { url, config, error });
				return;
			}
			this.emit('error', { url, config, error });
		} finally {
			if (this.delay && !jump) {
				setTimeout(() => {
					this.logger.info(`网络请求等待延迟:${url},${this.delay}`);
					this.complete();
				}, this.delay);
			} else {
				this.complete();
			}
		}
	}
	public appendMiddleware(
		fn: Http.DownloadMiddleware | Http.DownloadMiddleware[]
	) {
		if (Array.isArray(fn)) {
			this.middlewares = this.middlewares.concat(fn);
			return;
		}
		this.middlewares.push(fn);
	}
	public async callMiddleware(
		config: Http.MiddlewareConfig
	): Promise<Http.MiddlewareConfig | false> {
		let cfg: Http.MiddlewareConfig = config;
		for (const fn of this.middlewares) {
			const rc: Http.MiddlewareConfig | false = await fn(cfg);
			if (rc) {
				cfg = rc;
			} else if (rc === false) {
				return false;
			}
		}
		return cfg;
	}
	public decode(buffer: Buffer, charset?: any) {
		if (charset) {
			return iconv.decode(buffer, charset);
		}
		const tmp = iconv.decode(buffer, 'utf8');
		try {
			charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp);
			charset = charset
				.replace('charset=', '')
				.replace(/"/g, '')
				.replace('-', '')
				.trim();
		} catch (e) {
			charset = 'utf8';
		}
		if (charset.toLowerCase() === 'utf8') {
			return tmp;
		}
		return iconv.decode(buffer, charset);
	}
	private complete(): void {
		this.connect--;
		while (this.inspect()) {
			const task = this.queue.shift();
			if (task) {
				this.push(task.url, task.config);
			} else {
				break;
			}
		}
		if (this.connect === 0 && this.queue.length === 0) {
			this.emit('completeAll');
		}
	}
}
export default Http;
