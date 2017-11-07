module.exports = {
  "maximumFileSizeToCacheInBytes": 15000000,
  "globDirectory": "build/",
  "globPatterns": [
    "**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css}"
  ],
  "swDest": "build/sw.js",
  "globIgnores": [
    "../workbox-cli-config.js",
    "release-uuid.txt"
  ]
};
