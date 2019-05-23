const merge = require('webpack-merge')
const base = require('./wp.base.config')
const path = require('path')
function resolve(dir) {
  return path.resolve(__dirname, '../', dir)
}
module.exports = merge(base, {
  entry: {
    index: resolve('test/d1.ts')
  },
  mode: 'production'
})
