// webpack.config.js

'use strict';

/* eslint-env node */

const path = require( 'path' );
// const WriteFilePlugin = require( 'write-file-webpack-plugin' );
// const webpack = require( 'webpack' );
// const { bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const WebpackShellPlugin = require('webpack-shell-plugin');
// const BabiliPlugin = require( 'babel-minify-webpack-plugin' );
const buildConfig = require( './build-config' );

module.exports = {

  devtool: 'source-map',
  // devtool: 'none',
  // bail:true,

  // https://webpack.js.org/configuration/entry-context/
  entry: './ckeditor.js',

  // https://webpack.js.org/configuration/output/
  output: {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'ckeditor.js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: buildConfig.moduleName
  },

  plugins: [
    new CKEditorWebpackPlugin( {
      languages: [ buildConfig.language ]
    } ),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['./copy_dist.sh']})
    // ,
    // new BabiliPlugin( null, {
    //   comments: false
    // } ),
    // new webpack.BannerPlugin( {
    //   banner: bundler.getLicenseBanner(),
    //   raw: true
    // } )
  ],

  // plugins: [
  //   new WriteFilePlugin()
  // ],
  module: {
    rules: [
      {
        // Or /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/ if you want to limit this loader
        // to CKEditor 5's icons only.
        test: /\.svg$/,
        use: [ 'raw-loader' ]
      },
      {
        // Or /ckeditor5-[^/]+\/theme\/[^/]+\.scss$/ if you want to limit this loader
        // to CKEditor 5's theme only.
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          'sass-loader'
        ]
      }
    ]
  }
}
