module.exports = {
  "maximumFileSizeToCacheInBytes": 9915000000,
  "globDirectory": ".pwa-temporary",
  "globPatterns": [
    "**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css}"
  ],
  "swDest": ".pwa-temporary/sw.js",
  "skipWaiting": true,
  "globIgnores": [
    "../workbox-cli-config.js",
    "release-uuid.txt"
  ]
};
