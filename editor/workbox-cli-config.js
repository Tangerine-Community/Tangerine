module.exports = {
  "maximumFileSizeToCacheInBytes": 9915000000,
  "globDirectory": "./dist/",
  "globPatterns": [
    "**/*.{json,css,txt,ico,png,xml,svg,js,html,map}"
  ],
  "swDest": "dist/sw.js",
  "globIgnores": [
    "../workbox-cli-config.js",
    "sw.js"
  ],
  "skipWaiting": true,
  "runtimeCaching":  [
    {
      "urlPattern": new RegExp('/editor/'),
      "handler": "cacheOnly"
    },
    {
      "urlPattern": new RegExp('/ckeditor/'),
      "handler": "cacheOnly"
    }
  ]
};