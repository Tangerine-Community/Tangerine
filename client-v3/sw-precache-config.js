module.exports = {
  staticFileGlobs: [
    'dist/**.html',
    'dist/**.js',
    'dist/**.css',
    'dist/assets/images/*',
    'dist/assets/icons/*'
  ],
  root: 'dist',
  maximumFileSizeToCacheInBytes: 2097152000,
  stripPrefix: 'dist/',
  navigateFallback: '/index.html'
};
