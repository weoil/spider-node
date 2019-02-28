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
    try {
      config = { jar: false, encoding: null, ...this.baseConfig, ...config }
      const $config: NetWork.Config | false = this.callMiddleware({
        url,
        ...config,
        $system: this.$system
      })
      if ($config === false) {
        throw new Error('middleware return false')
      }
      const result = await rp(url, $config)
      const data: NetWork.Result = {
        url,
        config,
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
      if (this.delay) {
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
  public callMiddleware(config: NetWork.Config): NetWork.Config | false {
    let c: NetWork.Config | false = { ...config }
    for (const fn of this.middlewares) {
      c = fn(c)
      if (c === false) {
        break
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
