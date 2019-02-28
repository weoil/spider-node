import * as request from 'request'
import Rule from '@/rule'
import Spider from '../src/spider'
import CHttp from '../src/http'
declare namespace ISpider {
  type ErrorMiddleware = (
    url: string,
    Error: Error,
    config: NetWork.Config,
    spider: Spider
  ) => void
  type DownloadMiddleware = (config: NetWork.Config) => NetWork.Config | false
  interface rule {
    name?: string
    test: string | RegExp
    config?: IRule.IRuleConfig
    parse?: IRule.IParse
    pipeline?: IRule.IPipeline
    error?: IRule.IError
  }
  export interface Config {
    name: string
    rules: Array<rule>
    http?: Http
    overList?: Set<string>
    plan?: boolean
    open?: (spider: Spider) => Promise<any>
    close?: (spider: Spider) => Promise<any>
    downloadMiddleware?: [DownloadMiddleware]
    errorMiddleware?: [ErrorMiddleware]
    log?: boolean
  }
  export interface Http extends request.CoreOptions {
    maxConnect?: number
    delay?: number
    repeat?: boolean
    meta?: {
      [key: string]: any
    }
    $system?: {
      overlist?: Set<string>
      [key: string]: any
    }
  }
}

export declare namespace NetWork {
  interface Http {
    overlist: Set<string>
    maxConnect: number
    connect: number
    middlewares: Array<ISpider.DownloadMiddleware>
    ifInsert(): boolean
    run(url: string, config: Config): Promise<NetWork.Result>
    callMiddleware(config: Config): NetWork.Config | false
  }
  export interface Config extends request.CoreOptions {
    url?: string
    meta?: {
      [key: string]: any
    }
    $system?: {
      [key: string]: any
    }
  }
  export interface Result {
    url: string
    data: any
    config: Config
  }
}
export declare namespace IRule {
  interface IRuleConfig {
    baseUrl?: string
    include?: boolean
  }
  type IError = ISpider.ErrorMiddleware
  type IParse = (
    url: string,
    data: string | object,
    selector: CheerioSelector | null,
    config: NetWork.Config,
    spider: Spider
  ) => any
  type IPipeline = (item?: any, spider?: Spider) => any
}
