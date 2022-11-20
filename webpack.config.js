const webpack = require("webpack");
const path = require("path");
const DeclarationBundlerPlugin = require("./declaration-bundler-webpack-plugin.fix");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: {
    "build/index": path.resolve(__dirname, "src/index.ts"),
    "demo/index": path.resolve(__dirname, "src/demo/demo.ts"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "ts-loader",
      },
    ],
  },
  resolve: { extensions: [".ts"] },
  output: {
    library: ["Zfont"],
    path: path.resolve(__dirname, "./dist"),
    chunkFilename: "[name].js",
  },

  mode: "development",
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./package.json",
          to: "./../package.json",
        },
        {
          from: "./README.md",
          to: "./../README.md",
        },
        {
          from: "./src/demo/demo.css",
          to: "./demo/demo.css",
        },
        {
          from: "./src/demo/index.html",
          to: "./demo/index.html",
        },
        {
          from: "./src/demo/fredokaone.ttf",
          to: "./demo/fredokaone.ttf",
        },
      ],
    }),
  ],
  devtool: "source-map",
  externals: {
    Typr: "typr.js",
  },
};
