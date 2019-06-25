const spider = require('spider-node').default
const s = new spider({
  name: "test",
  rules: [
    {
      test: /movie\.douban\.com\/subject\/\d+/,
      parse(url) {
        console.log(url);
      }
    }
  ]
});
s.test("https://movie.douban.com/subject/30135113");
