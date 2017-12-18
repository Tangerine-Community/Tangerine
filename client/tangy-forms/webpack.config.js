const {resolve, join} = require('path');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');

/**
 * === ENV configuration
 */
const isDev = process.argv.find(arg => arg.includes('webpack-dev-server'));
const ENV = isDev ? 'development' : 'production';
const BROWSERS = process.env.BROWSERS === 'module' ?
  ['Chrome > 61'] : ['> 1%', 'last 2 versions', 'Firefox ESR', 'not ie <= 11'];
  // ['Chrome > 61'] : ['Chrome > 48'];
const IS_MODULE_BUILD = BROWSERS[0].includes('Chrome > 61');
const outputPath = isDev ? resolve('src') : resolve('dist');
const processEnv = {
  NODE_ENV: JSON.stringify(ENV),
  appVersion: JSON.stringify(pkg.version)
};

console.log("process.env.BROWSERS: " + process.env.BROWSERS)

/**
 * === Copy static files configuration
 */
const copyStatics = {
  copyWebcomponents: [{
    from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-hi-sd-ce.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/babel-polyfill/dist/polyfill.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/redux/dist/redux.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./bower_components/pouchdb/dist/pouchdb.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./node_modules/moment/min/moment-with-locales.min.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('./assets/fonts/fonts.css'),
    to: join(outputPath, 'fonts'),
    flatten: true
  }, {
    from: resolve('./node_modules/underscore/underscore.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('../ckeditor/dist/ckeditor.js'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }, {
    from: resolve('../ckeditor/dist/ckeditor.js.map'),
    to: join(outputPath, 'vendor'),
    flatten: true
  }],
  copyOthers: [{
    from: 'assets/**',
    context: resolve('./src'),
    to: outputPath
  }, {
    from: resolve('./src/index.html'),
    to: outputPath,
    flatten: true
  }, {
    from: resolve('./src/manifest.json'),
    to: outputPath,
    flatten: true
  }
  ]
};

/**
 * Plugin configuration
 */
const plugins = isDev ? [
  new CopyWebpackPlugin(copyStatics.copyWebcomponents),
  new webpack.DefinePlugin({'process.env': processEnv})
] : [
  new WorkboxPlugin({
    globDirectory: outputPath,
    globPatterns: ['**/*.{html, js, css, svg, png, woff, woff2, ttf}'],
    swDest: join(outputPath, 'sw.js')
  }),
  new CopyWebpackPlugin(
    [].concat(copyStatics.copyWebcomponents, copyStatics.copyOthers)
  ),
  new webpack.DefinePlugin({'process.env': processEnv})
];

/**
 * === Webpack configuration
 */
module.exports = {
  entry: './src/index.js',
  output: {
    path: outputPath,
    filename: IS_MODULE_BUILD ? 'module.bundle.js' : 'bundle.js'
  },
  devtool: 'source-map',
  // todo: this is used to make bower_components work
  // resolve: {
  //   descriptionFiles: ["package.json", "bower.json"],
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        // We need to transpile Polymer itself and other ES6 code
        // exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              'env',
              {
                targets: {browsers: BROWSERS},
                debug: true
              }
            ]]
          }
        }
      },
      {
        test: /\.html$/,
        use: ['text-loader']
      },
      {
        test: /\.postcss$/,
        use: ['text-loader', 'postcss-loader']
      }
    ]
  },
  plugins,
  devServer: {
    contentBase: [resolve(outputPath)],
    // contentBase: './content',
    compress: true,
    overlay: {
      errors: true
    },
    port: 3000,
    host: '0.0.0.0',
    disableHostCheck: true,
    before(app) {
      app.get('/content/field-demos/form.html', function (req, res) {
        return res.sendFile(join(__dirname, "../content/field-demos/form.html"));
      }),
        app.get('/content/field-demos/text-inputs.html', function (req, res) {
          return res.sendFile(join(__dirname, "../content/field-demos/text-inputs.html"));
        }),
        app.get('/content/location-list.json', function (req, res) {
          return res.sendFile(join(__dirname, "../content/location-list.json"));
        })
    }
  }
};
