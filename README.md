#### 使用方法

```
npm i spider-node -S

import Crawl from "spider-node";

const crawl=new Crawl()
crawl.registry('spiderName',spiderConfig);
crawl.start('spiderName',['url']);
```

#### 爬虫配置文件

```
const spiderConfig={
    maxConnect:0,//最大并发请求数,0为无限制
    delay:0,//请求间隔时间,设置后maxConnect=1
    http:{ //请求设置,合并到axios配置
            proxy: "http://127.0.0.1:1080"//代理
            charset:"utf8"//如果不填会根据页面推算出编码并解析
    },
    log:false,//默认为false,如果为true爬虫会打印运行状态日志,方便调试
    norepeat:true,//默认根据overList去除重复链接,默认为true
    overList:new Set(),//配置时设置已完成列表,下载时会自动调用添加url,避免重复访问
    async open:(config)=>{},//开始时调用
    async close(config)=>{}//结束时调用
    rules:[
        {
            test:/xxx\.html/ //需要被解析的网址正则表达式,
            baseUrl:"",//因为网页内链接很难准确的组合成对的url,所以在这里指定会默认和这个和resolve
            //网页请求完成后会进入parse函数进行解析,selector为被Cheerio处理后的对象
            parse:(url,content,selector,config)=>{},
            //parse可以返回一个item对象被pipeline接受，做储存等处理,需要异步操作时需要返回promise或者await等方式进行处理
            pipeline:async (item)=>{}
        }
    ],
    downloadMiddleware:[
        (url,config)=>{ } //改变config进行相应的网络处理,返回false终止下载
    ],
    errorMiddleware:[
        e=>{
            //错误中间件
        }
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
crawl.on(xx,()=>{});
open:启动时
close:爬虫全部完成
parse:解析时
download:下载时
downloadCompletion：下载完成
finished：一次任务完成
plan:计划任务启动
error:错误时
```

#### 例子

```
import SpiderNode from "spider-node";
const spider = new SpiderNode();
const jyPorn = {
 name: "jyPorn",
 maxConnect: 5,
 log: false,
 norepeat:true,
 http: {
   headers: {
     "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6",
     "User-Agent":
       " Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
   },
   proxy: setting.proxy
 },
 downloadMiddleware: [async (url, config) => {}],
 errorMiddleware: [
   e => {
     log.error(e, "error");
   }
 ],
 rules: [
   {
     test: /\?category=&page=[\d]*/,
     async parse(url, content, selector) {
       const $ = selector;
       let list = $("div[class=listchannel]");
       let item = [];
       let currentDay = Day().format("YYYY-MM-DD hh-mm-ss");
       list.each((index, i) => {
         let url = $(i)
           .children("div>a")
           .attr("href");
         let img = $(i)
           .find("a img")
           .attr("src");
         let title = $(i)
           .find("a img")
           .attr("title");
         let text = $(i).text();
         let date: any = /时间:([^前]{1,10})/.exec(text)[1].trim();
         let duration = /时长:([^添]{1,10})/.exec(text)[1].trim();
         if (date === "") {
           date = Date.now();
         } else {
           let day: any = /[\d]*/.exec(date)[0].trim();
           let type: any = "";
           if (date.indexOf("分钟") > 0) {
             type = "hour";
             date = Date.now();
           } else {
             if (date.indexOf("小时") > 0) type = "hour";
             else if (date.indexOf("天") > 0) type = "day";
             else if (date.indexOf("月") > 0) type = "month";
             else if (date.indexOf("年") > 0) type = "year";
             date = Day()
               .subtract(day, type)
               .valueOf();
           }
         }
         item.push({
           id: /viewkey=([^&]*)&/.exec(url)[1],
           title,
           poster: img,
           url,
           date,
           duration,
           browseNumber: 0,
           star: 0,
         });
       });
       return item;
     },
     pipeline: async item => {
       try {
         await vm.insertMany(item, { ordered: false });
       } catch (e) {}
     }
   }
 ],
 open: async ctx => {}
};
spider.registry("91porn", jyPorn);
spider.star("91porn", "http://91porn.com/video.php?category=&page=2");
```
