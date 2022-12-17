const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');


module.exports = {
  resolve: {
    alias: {
      lit: path.resolve(__dirname, 'node_modules/lit/'),
    },
  },
  plugins: [
    new NodePolyfillPlugin()
  ]
};