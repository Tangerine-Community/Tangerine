module.exports = {
  "maximumFileSizeToCacheInBytes": 9915000000,
  "globDirectory": ".pwa-temporary",
  "globPatterns": [
    "**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css,woff2,woff,ttf,mp3,mp4}"
  ],
  "swDest": ".pwa-temporary/sw.js",
  "skipWaiting": true,
  "globIgnores": [
    "../workbox-cli-config.js",
    "release-uuid.txt"
  ]
};
