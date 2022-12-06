module.exports = {
	globDirectory: '.pwa-temporary',
	globPatterns: [
		'**/*.{md,html,json,png,txt,xml,ico,svg,jpg,gif,js,css,woff2,woff,ttf}'
	],
	swDest: '.pwa-temporary/sw.js',
  skipWaiting: true,
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
		/^utm_source=web_app_manifest/
	]
};