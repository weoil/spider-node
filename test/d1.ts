import { Spider } from '../src/index'

const testConfig = {}

const spider = new Spider({
  name: 'mdn',
  http: {
    delay: 5000,
    meta: {
      a: 1
    }
  },
  rules: [
    {
      test: /\/zh-CN\/docs\/[^"']*/,
      parse(url, data, $, c, _) {
        console.log('23333', url, c)
        if (c.meta.a) {
          c.meta.a += 1
        }
      },
      error(url, error, c, s) {
        console.log('error', url)
      }
    }
  ]
})
spider.start('https://developer.mozilla.org/zh-CN')
