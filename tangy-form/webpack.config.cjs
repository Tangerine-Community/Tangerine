const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  // // if you see error `Module not found: Error: Can't resolve 'fs' in ...`, this can ignore these modules.
  // // you can also specify fallbacks. see https://webpack.js.org/configuration/resolve/#resolvefallback
  // resolve: {
  //   fallback: {
  //     fs: false,
  //     path: false,
  //     crypto: false
  //   }
  // }
  node: {
    dns: 'mock',
    fs: 'empty',
    path: true,
    url: false
  }
};
