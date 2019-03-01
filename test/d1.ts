import { Spider } from '../src/index'
import { NetWork } from '../types/spider'
const testConfig = {}
const M = new Map()
M.set('https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas', {})
const spider = new Spider({
  name: 'mdn',
  http: {
    delay: 500,
    meta: {
      a: 1
    },
    $system: {
      overlist: M
    }
  },
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
      },
      config: {
        expire: 10000
      }
    }
  ]
})
// spider.use((config: NetWork.MiddlewareConfig) => {
//   console.log('middleware', config)
//   return config
// })
spider.start('https://developer.mozilla.org/zh-CN')
