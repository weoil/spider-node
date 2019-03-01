import NoRepeatMid from '@/middleware/repeat'
import { ISpider, NetWork } from '@@/types/spider'
import { EventEmitter } from 'events'
import iconv from 'iconv-lite'
import rp from 'request-promise'

interface IHttpTask {
  url: string
  config: NetWork.Config
}
class Http extends EventEmitter implements NetWork.Http {
  public static clone(http: Http): Http {
    return new Http(http.baseConfig, http.middlewares)
  }
  public delay: number = 0
  public overlist: Set<string> = new Set()
  public maxConnect: number = Infinity
  public connect: number = 0
  public middlewares: ISpider.DownloadMiddleware[] = []
  public timer: NodeJS.Timeout | null = null
  public baseConfig: NetWork.Config = {}
  public $system: { [key: string]: any } = {}
  private queue: IHttpTask[] = []
  constructor(
    config: ISpider.Http = {
      repeat: false
    },
    middlewares?: ISpider.DownloadMiddleware[]
  ) {
    super()
    const cfg = (this.baseConfig = { ...this.baseConfig, ...config })
    if (cfg.maxConnect) {
      this.maxConnect = cfg.maxConnect
      delete cfg.maxConnect
    }
    if (cfg.delay) {
      this.maxConnect = 1
      this.delay = cfg.delay
      delete cfg.delay
    }
    if (!cfg.repeat) {
      this.middlewares.push(NoRepeatMid)
      delete cfg.repeat
    }
    if (cfg.$system) {
      this.$system = cfg.$system
      delete cfg.$system
    }
    if (middlewares) {
      this.middlewares = [...this.middlewares, ...middlewares]
    }
  }
  public ifInsert(): boolean {
    // console.log(this.connect, this.maxConnect, this.queue.length)
    if (this.connect < this.maxConnect) {
      return true
    }
    return false
  }
  public async push(
    url: string,
    config: NetWork.Config = {},
    priority: boolean = false
  ): Promise<any> {
    if (this.ifInsert()) {
      this.run(url, config)
      return
    }
    const queue = this.queue
    if (priority) {
      queue.unshift({ url, config })
    } else {
      queue.push({ url, config })
    }
  }
  public async run(url: string, config: NetWork.Config = {}): Promise<any> {
    this.connect++
    let jump = false
    try {
      let $config: NetWork.Config | false = {
        jar: false,
        encoding: null,
        ...this.baseConfig,
        ...config
      }
      const system = this.$system
      $config = this.callMiddleware({
        url,
        ...config,
        $rule: {},
        $system: system
      })
      if ($config === false) {
        jump = true
        throw new Error('middleware return false')
      }
      delete $config.$system
      delete $config.$rule
      const result = await rp(url, config)
      const data: NetWork.Result = {
        url,
        config: {
          ...this.baseConfig,
          ...$config
        },
        data: result
      }
      if (!config.encoding) {
        const charset = config.meta && config.meta.charset
        data.data = this.decode(result, charset)
      }
      this.emit('complete', data)
    } catch (error) {
      this.emit('error', { url, config, error })
    } finally {
      if (this.delay && !jump) {
        this.timer = setTimeout(() => {
          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
          }
          this.complete()
        }, this.delay)
      } else {
        this.complete()
      }
    }
  }
  public appendMiddleware(
    fn: ISpider.DownloadMiddleware | ISpider.DownloadMiddleware[]
  ) {
    if (Array.isArray(fn)) {
      this.middlewares = this.middlewares.concat(fn)
      return
    }
    this.middlewares.push(fn)
  }
  public callMiddleware(
    config: NetWork.MiddlewareConfig
  ): NetWork.MiddlewareConfig | false {
    let c: NetWork.MiddlewareConfig | false = { ...config }
    for (const fn of this.middlewares) {
      const rc = fn(c)
      if (rc) {
        c = rc
      } else if (rc === false) {
        return false
      }
    }
    return c
  }
  public decode(buffer: Buffer, charset?: any) {
    if (charset) {
      return iconv.decode(buffer, charset)
    }
    const tmp = iconv.decode(buffer, 'utf8')
    try {
      charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp)
      charset = charset
        .replace('charset=', '')
        .replace(/"/g, '')
        .replace('-', '')
        .trim()
    } catch (e) {
      charset = 'utf8'
    }
    if (charset.toLowerCase() === 'utf8') {
      return tmp
    }
    return iconv.decode(buffer, charset)
  }
  private complete(): void {
    this.connect--
    while (this.ifInsert()) {
      const task = this.queue.shift()
      if (task) {
        this.push(task.url, task.config)
      } else {
        break
      }
    }
    if (this.connect === 0 && this.queue.length === 0) {
      this.emit('completeAll')
    }
  }
}
export default Http
