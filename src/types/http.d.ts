interface HttpImp {
  config: any
  middleware: any[]
  errorMiddleware: any[]
  $: any
  request(url: string): any
}
