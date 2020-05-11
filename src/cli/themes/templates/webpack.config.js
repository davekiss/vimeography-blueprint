const webpack = require("webpack");
const path = require("path");
const ManifestPlugin = require("webpack-manifest-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  devtool: isProduction ? "cheap-module-source-map" : "eval-source-map",
  devServer: {
    publicPath: "http://localhost:8080/",
    contentBase: "./dist",
    https: true,
    hot: true,
    inline: true,
    disableHostCheck: true,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
    },
  },
  target: "web",
  entry: "./src/index",

  output: {
    filename: isProduction ? "scripts.[hash:8].js" : "scripts.js",
    path: path.resolve(__dirname, "dist"),
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dom7|swiper)\/).*/,
        loader: "babel-loader",
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        exclude: /node_modules/,
        options: {
          postcss: [require("postcss-cssnext")()],
        },
      },
      {
        test: /\.(scss|css)$/,

        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
          fallback: "style-loader",
        }),
      },
    ],
  },

  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
  },

  plugins: [
    new CleanPlugin([path.resolve(__dirname, "dist")], {
      verbose: false,
    }),
    new ExtractTextPlugin({
      filename: isProduction ? "styles.[hash:8].css" : "styles.css",
      disable: false,
    }),
    new ManifestPlugin(),
  ],
};

if (isProduction) {
  module.exports.plugins.push(new MinifyPlugin());
}
