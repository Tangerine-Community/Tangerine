const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack');
// const BROWSERS = ['Chrome 49'];
const BROWSERS = process.env.BROWSERS === 'module' ?
  ['last 2 Chrome versions', 'Safari 10'] : ['> 1%', 'last 2 versions', 'Firefox ESR', 'not ie <= 11'];

module.exports = [{

  name: "es5",

  devtool: 'source-map',

  // https://webpack.js.org/configuration/watch/
  watch: true,

  // https://webpack.js.org/configuration/entry-context/
  entry: './index.js',
  // entry: ['babel-polyfill', './index.js'],


  // https://webpack.js.org/configuration/output/
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundleES5.js',

  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|dist)/,
        // include: [
        //   path.join(__dirname, '../src'), // + any other paths that need to be transpiled
        //   /\/node_modules\/@polymer/,
        // ],
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: [[
          //     'env',
          //     {
          //       targets: {browsers: BROWSERS},
          //       debug: true,
          //       "modules": false,
          //     }
          //   ]]
          // }
          // options: {
          //   // presets: [['babel-preset-env']]
          //   // presets: [['babel-preset-env', {"exclude": ["transform-regenerator"]}]]
          //   presets: [[
          //     'env',
          //     {
          //       // targets: {browsers: BROWSERS},
          //       targets: {
          //         "chrome": 49
          //       },
          //       debug: true,
          //       "exclude": ["transform-regenerator"],
          //       "modules": false
          //     }
          //   ]]
          // }
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
      template: './index.html',
      inject: false
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
      },
      {
        from: path.resolve(__dirname, './node_modules/underscore/underscore.js'), to: 'js/underscore.js'
      },
      {
        from: path.resolve(__dirname, './node_modules/babel-polyfill/dist/polyfill.js'), to: 'js/polyfill.js'
      },
      {
        from: path.resolve(__dirname, './node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'), to: 'js/custom-elements-es5-adapter.js'
      },
      {
        from: path.resolve(__dirname, './node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js'), to: 'js/webcomponents-sd-ce.js'
      },
      {
        from: path.resolve(__dirname, './node_modules/browser-es-module-loader/dist/babel-browser-build.js'), to: 'js/babel-browser-build.js'
      },
      {
        from: path.resolve(__dirname, './node_modules/browser-es-module-loader/dist/browser-es-module-loader.js'), to: 'js/browser-es-module-loader.js'
      }
    ]),
    // get around with stupid warning
    new webpack.IgnorePlugin(/vertx/),
  ]
},
  {
    name: "es6",
    devtool: 'source-map',

    // https://webpack.js.org/configuration/watch/
    watch: true,

    // https://webpack.js.org/configuration/entry-context/
    entry: './index.js',
    // entry: ['babel-polyfill', './index.js'],


    // https://webpack.js.org/configuration/output/
    output: {
    path: path.resolve(__dirname, 'dist'),
      filename: 'bundleES6.js',

  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      }
      // {
        // test: /\.js$/,
        // exclude: /(node_modules|bower_components|dist)/,
        // include: [
        //   path.join(__dirname, '../src'), // + any other paths that need to be transpiled
        //   /\/node_modules\/@polymer/,
        // ],
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets: [['babel-preset-env']]
        //     // presets: [['babel-preset-env', {"exclude": ["transform-regenerator"]}]]
        //   }
        // }
      // }
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
      template: './index.html',
      inject: false
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
      },
      {
        from: path.resolve(__dirname, './node_modules/underscore/underscore.js'), to: 'js/underscore.js'
      }
    ]),
    // get around with stupid warning
    new webpack.IgnorePlugin(/vertx/),
  ]
}];