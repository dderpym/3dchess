const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
  output: {
    filename: "bundle.js", //name for the js file that is created/compiled in memory
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080, //port that we're using for local host (localhost:8080)
    allowedHosts: ["all"],
    static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
    hot: true,
    devMiddleware: {
      publicPath: "/",
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.obj$/,
        use: "webpack-obj-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      path: "/",
      inject: true,
      template: path.resolve(appDirectory, "public/index.html"),
    }),
  ],
  mode: "development",
};
