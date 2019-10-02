node 爬虫工具,根据配置进行网络请求,通过正则匹配对应各个规则的解析函数,自动推导网站编码,post 请求,自动去重(可规定有限期),定时任务,日志,可以通过自定义中间件的形式添加代理,默认不携带 cookie,如果需要在 config 中写入(或者在中间件中动态添加),通过 maxConnect 和 delay 来限制同时访问次数,网络请求使用了[request](https://github.com/request/request),参照它来进行相应的配置.

```
npm i spider-node
-- const spiderNode = require('spider-node').default
or es6
-- import spiderNode from 'spider-node'

const spider = new spiderNode(config) // config请参照下方,具体使用方式可以参照test中的测试用例
spider.start('https://www.baidu.com')
```

#### config

```js
{
  name:'spider', // 名称
  log:true,// 是否打印日志
  http:{
    maxConnect?: number // 规则默认的最大连接 如果规则本身没有制定则会继承此设置(如果为1,则会等待上一个任务结束后再次发送任务)
    delay?: number // 每次请求后的等待时间
    repeat?: boolean // 是否允许重复，默认false不允许重复
    charset?:string // 编码方式 如果是html文本 将用于解析默认为: utf-8
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
        maxConnect?:number, // 最大连接数（如果没有设置则继承http中的最大连接数
        delay?:number // 单个规则的等待时间（如果没有设置则继承http中的delay
        http:HttpConfig, // 单独配置网络配置,同上
        meta:{ // 可携带自定义信息 可在处理函数中修改
        }
      },
      async parse(url,data,selector,config,spider){
        url // url
        data // 数据
        selector // cheerio选择器
        config // 该url的配置,可以取出meta response可以查看原始返回数据
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

| method |                                         args                                          | info                                                                                                                                                             |
| ------ | :-----------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| start  |                                         urls                                          | 启动 url,可为数组或字符串                                                                                                                                        |
| test   |                                         urls                                          | 以测试规则启动,不会自动匹配 url                                                                                                                                  |
| use    |                                       function                                        | 注册下载中间件                                                                                                                                                   |
| rule   |                    (name,regexp,parse,...pipeline,config)=>Promise                    | 注册规则,如果最后一个 pipeline 不是 function 而是 object 时,将使用该值为配置进行注册,返回一个 Promise,当 rule 报错时可用.catch 捕获 (与 config 中定义 rule 一致) |
| push   |                                      url,config                                       | 新增请求,config 为 HttpConfig 并且拥有 meta,meta 值可以在 parse 中获取到                                                                                         |
| plan   | corntabStr,urls,immediate:是否立即执行第一次,RecurrenceRule：node-schedule 的相关配置 | 定时任务请求,接收 corntab 语法的规则,将在特定时间执行检测,如果处于休眠状态,将再次读取 urls 启动                                                                  |
| cancel |                                          无                                           | 关闭进程                                                                                                                                                         |

中间件应该具备的能力:
读取本身 http 的已经访问列表,读取网络配置,读取 rule 的配置
