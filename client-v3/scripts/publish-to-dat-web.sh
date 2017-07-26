./node_modules/.bin/angular-pages build
ng build --aot --prod
sw-precache --verbose --config=sw-precache-config.js
cd dist
if [ -d ../dat ]; then
  mv ../dat ./.dat
fi
gtimeout 7 ../node_modules/.bin/dat share 
cp -r .dat ../dat
../node_modules/.bin/dat share
