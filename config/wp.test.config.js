const merge = require('webpack-merge');
const base = require('./wp.base.config');
const nodeExternals = require('webpack-node-externals');

const path = require('path');
function resolve(dir) {
  return path.resolve(__dirname, '../', dir);
}
module.exports = merge(base, {
  entry: {
    index: resolve('test/kechuang.ts'),
  },
  mode: 'development',
  // externals: [nodeExternals()]
});
