module.exports = {
  "maximumFileSizeToCacheInBytes": 9915000000,
  "globDirectory": "build/",
  "globPatterns": [
    "**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css}"
  ],
  "swDest": "build/sw.js",
  "skipWaiting": true,
  "globIgnores": [
    "../workbox-cli-config.js",
    "release-uuid.txt"
  ]
};
