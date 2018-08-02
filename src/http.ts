import axios from "axios"
import * as iconv from "iconv-lite"
class Http implements HttpImp {
  config: any
  middleware: any[]
  errorMiddleware: any[]
  $: any
  constructor(config: {}, middleware?: any[], errorMiddleware?: any[]) {
    this.config = config
    this.middleware = middleware
    this.errorMiddleware = errorMiddleware
    this.$ = axios.create(this.config)
  }
  private async callMiddleware(url: string, middleware: any[], ...args: any[]) {
    if (!middleware) return true
    for (const mid of middleware) {
      let result = await mid(url, ...args)
      if (result === false) return false
    }
  }
  async request(url: string) {
    try {
      let result = await this.callMiddleware(url, this.middleware, this.config)
      if (result === false) return
      let res = await this.$({
        url: url,
        method: "get",
        ...this.config,
        responseType: "arraybuffer"
      })
      let data = this.decode(res.data, this.config["charset"])
      return data
    } catch (e) {
      console.log(e.message)

      this.callMiddleware(url, this.errorMiddleware, e)
      return e
    }
  }
  public decode(buffer: any, charset?: string) {
    if (charset) {
      return iconv.decode(buffer, charset)
    }
    let tmp = iconv.decode(buffer, "utf8")
    try {
      charset = /charset\=[^"].*"|charset\="[^"].*"/.exec(tmp)[0]
      charset = charset
        .replace("charset=", "")
        .replace(/"/g, "")
        .replace("-", "")
        .trim()
    } catch (e) {
      charset = "utf8"
    }
    if (charset.toLowerCase() === "utf8") {
      return tmp
    }
    return iconv.decode(buffer, charset)
  }
}

export default Http
