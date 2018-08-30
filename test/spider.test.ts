import Crawl from "../dist/index.js";
console.log(Crawl);

let cl = {
  name: "caoliu",
  maxConnect: 0,
  delay: 1000,
  http: {
    proxy: "http://127.0.0.1:1080"
  },
  log: true,
  rules: [
    {
      test: /thread0806\.php\?fid=[\d]*&search=&page=[\d]*/
    },
    {
      test: /htm_data\/16\/\d*\/\d*\.html/,
      parse: async (url, content, selector) => {
        const $ = selector;
        let inputs = $("input[type=image]"),
          imgs = [];
        let unType = [/www1\.wi\.to/];
        inputs.each(i => {
          let ipt = inputs[i];
          let img = ipt.attribs["src"];
          if (!img) {
            img = ipt.attribs["data-src"];
          }
          let flag = true;
          for (let r of unType) {
            if (r.test(img)) {
              flag = false;
              break;
            }
          }
          flag && imgs.push(img);
        });
        let title = $("h4")
          .eq(0)
          .text();
        title ? (title = title.replace(/\[[^\]]{1,8}\]/g, "").trim()) : void 0;
        if (!title || (title === "" && !imgs.length)) {
          return;
        }
        const item = {
          url: url,
          title: title,
          images: imgs,
          length: imgs.length
          // spiderDate: spiderDate
        };
        return item;
      },
      pipeline: async item => {
        console.log(item.title);
      }
    }
  ],
  downloadMiddleware: [
    (url, config) => {
      console.log("url->downloadMiddleware", url);
    }
  ]
};
let C = new Crawl();
C.registry("caoliu", cl);
// C.test("caoliu", "http://www.t66y.com/htm_data/16/1807/3212889.html")
C.start("caoliu", "http://www.t66y.com/thread0806.php?fid=16&search=&page=2");
// C.start("caoliu", "http://www.t66y.com/thread0806.php?fid=16&search=&page=2", {
//   interval: 10000,
//   findlist: [/thread0806\.php\?fid=[\d]*&search=&page=[2]{1}$/],
//   include: [
//     /htm_data\/16\/\d*\/\d*\.html/,
//     /thread0806\.php\?fid=[\d]*&search=&page=[2]{1}$/
//   ],
//   url: ["http://www.t66y.com/thread0806.php?fid=16&search=&page=2"]
// });
