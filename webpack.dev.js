const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const common =require("./webpack.common");

module.exports = merge(common, {
  entry: "./example/main.ts",
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Tweener Example"
    })
  ],
  devServer: {
    hot: true,
    inline: false,
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8080
  }
});
