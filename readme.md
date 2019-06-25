```
npm i spider-node
-- const spider = require('spider-node').default
or es6
-- import spider from 'spider-node'
```
#### config

```js
{
  name:'spider', // 名称
  log:true,// 是否打印日志
  http:{
    maxConnect?: number // 最大连接 如果为1 则会等待上一个任务结束后再次发送任务
    delay?: number // 每次请求后的等待时间
    repeat?: boolean // 是否允许重复
    meta?: { // 可携带自定义信息
      [key: string]: any
    },
    overlist:Set<string>, // 已完成列表
    ...requestConfig // requets配置
  },
  rules:[
    {
      test: /regExp/,
      config:{ // rule 配置
        include:boolean, // 是否从url中按照规则匹配url (true)
        expire:180000, // 当去重开启时,规定去重的缓存存在时间,在该时间过后,将视为新url不再去重
        baseUrl:'', // 从文件自动匹配url时,将会默认根据父级url进行拼接,如果提供此值,将使用它
        http:HttpConfig, // 该规则独特的网络config
        meta:{ // 可携带自定义信息
        }
      },
      async parse(url,data,selector,config,spider){
        url // url
        data // 数据
        selector // cheerio选择器
        config // 该url的配置,可以取出meta
        spider // 爬虫实例,可以调用push进行添加请求(可通过 spider.push(url,{meta:{}}))的方式传递信息
      },
      async pipeline(item){
        // parse的返回值将进入
      },
      error(url,error,config,spider){
        // 错误后调用
      }
    }
  ],
  async open(){
    // 启动时调用
  },
  async close(){
    // 结束时调用
  },
  downloadMiddleware:[
    async (config:{
      url,...config,
      $sysytem:{overlist},
      $rule:{ruleConfig}
    })=>{
      // 下载中间件
      // return false 中断请求
      // return config 可改变config
    }
  ],
  errorMiddware:[
    (
      url,error,config,spider
    )=>{
      // 下载失败中间件
    }
  ]
}
```
#### 定时任务 遵循 corntab 语法
```
spider.plan("秒 分 时 日 月 周几",()=>{
  return ['https://www.baidu.com']
})
```
### API

urls = string || string[] || Set<string> || (function():string||string[]|| Set<string>)

| method |                      args                       | info                                                                                                                                                             |
| ------ | :---------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| start  |                      urls                       | 启动 url,可为数组或字符串                                                                                                                                        |
| test   |                      urls                       | 以测试规则启动,不会自动匹配 url                                                                                                                                  |
| use    |                    function                     | 注册下载中间件                                                                                                                                                   |
| rule   | (name,regexp,parse,...pipeline,config)=>Promise | 注册规则,如果最后一个 pipeline 不是 function 而是 object 时,将使用该值为配置进行注册,返回一个 Promise,当 rule 报错时可用.catch 捕获 (与 config 中定义 rule 一致) |
| push   |                   url,config                    | 新增请求,config 为 HttpConfig 并且拥有 meta,meta 值可以在 parse 中获取到                                                                                         |
| plan   |                 corntabStr,urls                 | 定时任务请求,接收corntab语法的规则,将在特定时间执行检测,如果处于休眠状态,将再次读取urls启动                                                                      |


中间件应该具备的能力:
读取本身http的已经访问列表,读取网络配置,读取rule的配置