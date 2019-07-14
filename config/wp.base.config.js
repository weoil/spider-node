const merge = require("webpack-merge");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
function resolve(dir) {
  return path.resolve(__dirname, "../", dir);
}
module.exports = merge(
  {},
  {
    mode: "development",
    target: "node",
    entry: {
      index: ["@babel/polyfill", resolve("src/index.ts")]
    },
    output: {
      path: resolve("dist"),
      filename: "[name].js",
      libraryTarget: "umd"
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: "babel-loader"
            },
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                compilerOptions: {
                  module: "ESNext"
                }
              }
            }
          ]
        }
      ]
    },
    resolve: {
      alias: {
        "@": resolve("src/"),
        "@@": resolve("./")
      },
      extensions: [".js", ".ts", ".json"]
    },
    externals: [nodeExternals()]
    // optimization: {
    //   splitChunks: {
    //     chunks: "initial",
    //     name: "common"
    //   }
    // }
  }
);
