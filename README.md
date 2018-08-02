#### 使用方法

```
npm i web-spider-go -S

const spiderGo = require("web-spider-go");
const crawl=new spiderGo()
crawl.registry('spiderName',spiderConfig);
crawl.start('spiderName',['url']);
```

#### 爬虫配置文件

```
const spiderConfig={
    maxConnect:0,//最大并发请求数,0为无限制
    delay:0,//请求间隔时间,设置后maxConnect=1
    http:{ //请求设置,合并到axios配置
            proxy: { //设置代理
            host: "127.0.0.1",
            port: 1080
        },
        charset:"utf8"//如果不填会根据页面推算出编码并解析
    },
    overList:new Set(),//配置时设置已完成列表,下载时会自动调用添加url,避免重复访问
    async open:(config)=>{},//开始时调用
    async close(config)=>{}//结束时调用
    rules:[
        {
            test:/xxx\.html/ //需要被解析的网址正则表达式,
            //网页请求完成后会进入parse函数进行解析,selector为被Cheerio处理后的对象
            parse:(url,content,selector,config)=>{},
            //parse可以返回一个item对象被pipeline接受，做储存等处理,需要异步操作时需要返回promise或者await等方式进行处理
            pipeline:async (item)=>{}
        }
    ],
    downloadMiddleware:[
        (url,config)=>{ } //改变config进行相应的网络处理,返回false终止下载
    ]
}
```

#### 测试 url 解析处理

```
    crawl.test('spiderName',spiderConfig)
    //以test启动的项目只会寻找目标解析函数,而不会对网页内匹配的url加入下载
```

#### 计划任务

```
    //启动时加入参数 plan
    crawl.start('xxx',config,{
        findlist:[/url-regexp/], //可以解析内部并自动匹配加入下载的url
        inclide:[/url-regexp/], //可以解析内部的url
        interval:100000, //间隔时间
        url:[''] //每次计划启动url列表，也可以是单个url,启动时会把相应的url从overList从删除
    })
```

#### 事件

```
open:启动时
close:爬虫全部完成
parse:解析时
download:下载时
downloadCompletion：下载完成
finished：一次任务完成
plan:计划任务启动
```
