const { Spider } = require('../dist/index')
const spider = new Spider({
  name: 'mdn',
  http: {
    // delay: 1000,
    meta: {
      a: 1
    }
  },
  middleware: [
    config => {
      console.log(config)
      return config
    }
  ],
  rules: [
    {
      test: /\/zh-CN\/docs\/[^"']*/,
      parse(url, data, $, c, _) {
        console.log('23333', url, c)
        if (c.meta && c.meta.a) {
          c.meta.a += 1
        }
      },
      error(url, error, c, s) {
        console.log('error', url)
      }
    }
  ],
})
console.log(spider, spider.start)
spider.start('https://developer.mozilla.org/zh-CN')