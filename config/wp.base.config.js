const merge = require('webpack-merge')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
function resolve(dir) {
  return path.resolve(__dirname, '../', dir)
}
module.exports = merge(
  {},
  {
    mode: 'development',
    target: 'node',
    entry: {
      index: resolve('src/index.ts')
    },
    output: {
      path: resolve('dist'),
      filename: '[name].js',
      library: 'spider',
      // umdNamedDefine: true,
      libraryTarget: 'umd'
    },
    module: {
      unknownContextCritical: false,
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader'
            }
          ]
        }
      ]
    },
    resolve: {
      alias: {
        '@': resolve('src/'),
        '@@': resolve('./')
      },
      extensions: ['.js', '.ts', '.json']
    },
    externals: [nodeExternals()],
    optimization: {
      splitChunks: {
        chunks: 'initial',
        name: 'common'
      }
    }
  }
)
