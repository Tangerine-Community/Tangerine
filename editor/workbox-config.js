// // A config for `generateSW`
// import path from "path";
//
// export default {
//   maximumFileSizeToCacheInBytes: 9915000000,
//   globDirectory: '.pwa-temporary',
//   globPatterns: [
//     '**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css,woff2,woff,ttf}'
//   ],
//   swDest: '.pwa-temporary/sw.js',  
//   skipWaiting: true,
//   globIgnores: [
//     "../workbox-cli-config.js",
//     "release-uuid.txt"
//   ],
//   resolve: {
//     alias: {
//       lit: path.resolve(__dirname, 'node_modules/lit/'),
//     },
//   },
// };

// const path = require('path');

module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,json,css,txt,png,xml,ico,svg,html,gif}'
  ],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/
  ],
  maximumFileSizeToCacheInBytes:9915000000
};