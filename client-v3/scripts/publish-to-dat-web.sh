./node_modules/.bin/angular-pages build
ng build --aot --prod
sw-precache --verbose --config=sw-precache-config.js
cd dist
../node_modules/.bin/dat share
