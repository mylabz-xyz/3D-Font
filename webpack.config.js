const webpack = require("webpack");
const path = require("path");
const DeclarationBundlerPlugin = require("./declaration-bundler-webpack-plugin.fix");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: {
    index: path.resolve(__dirname, "src/index.ts"),
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
    path: path.resolve(__dirname, "./dist/build"),
    chunkFilename: "[name].js",
    filename: "[name].js",
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
      ],
    }),
  ],
  devtool: "source-map",
  externals: "typr-ts",
};
