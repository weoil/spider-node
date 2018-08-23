const nodeExternals = require("webpack-node-externals");
module.exports = {
  entry: {
    // filename: "./src/index.ts"
    filename: "./src/index.ts"
  },
  output: {
    filename: "index.js",
    path: __dirname + "/dist",
    libraryTarget: "commonjs2"
  },
  target: "node",
  mode: "production",
  devtool: "",
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "awesome-typescript-loader"
      }
    ]
  }
};
