const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack');

module.exports = {

  devtool: 'source-map',

  // https://webpack.js.org/configuration/watch/
  watch: true,

  // https://webpack.js.org/configuration/entry-context/
  entry: './index.js',

  // https://webpack.js.org/configuration/output/
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',

  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname, '..')}),

    // new webpack.NormalModuleReplacementPlugin(
    //   /environments\/environment\.ts/,
    //   'environment.prod.ts'
    // ),
    // new CommonsChunkPlugin({
    //   // The order of this array matters
    //   names: ['vendor'],
    //   minChunks: Infinity
    // }),
    // not able to uglify, probably related to: https://github.com/Polymer/polymer-cli/issues/388
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: true
    // }),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      // {
      //   from: path.resolve(__dirname, '../static'),
      //   to: 'static',
      //   ignore: ['.*']
      // },
      {
        from: path.resolve(__dirname, './node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js'), to: 'js/webcomponents-loader.js',
      },
      {
        from: path.resolve(__dirname, './node_modules/redux/dist/redux.js'), to: 'js/redux.js'
      },
      {
        from: path.resolve(__dirname, './fonts/fonts.css'), to: 'fonts/fonts.css'
      }
    ]),
    // get around with stupid warning
    new webpack.IgnorePlugin(/vertx/),
  ]
};