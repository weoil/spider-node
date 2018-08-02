interface spiderConfig {
  name: string
  rules: Array<ruleImp>
  http: {}
  charset?: string
  maxConnect?: number
  overList?: Set<string>
  plan?: boolean
  delay?: number
  open?: any
  close?: any
  downloadMiddleware: any[]
  errorMiddleware: any[]
}
interface planImp {
  interval: number
  findlist: any[]
  include: any[]
  url: string | Array<string>
  timer: any
}
interface ruleImp {
  test: RegExp
  parse(url: string, content: string, selector: any): any
  pipeline(item: any): void
}
