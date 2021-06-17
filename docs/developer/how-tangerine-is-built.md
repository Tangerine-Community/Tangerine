# How Tangerine code is generated

When the develop.sh script is run, the Dockerfile builds tangerine into dist/tangerine-client and copies the built code into builds/apk/www/shell and builds/pwa/release-uuid/app. 

## Building files

When Dockerfile is complete, it runs entrypoint-development.sh and watches for changes, sending its output to the dev directory:

```
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev 
```

## Copy files

If you need to make an apk using the updated code, run the following script:

```javascript
cd /tangerine/client && \
rm -rf builds/apk/www/shell && \
rm -rf builds/pwa/release-uuid/app && \
cp -r dev builds/apk/www/shell && \
cp -r pwa-tools/updater-app/build/default builds/pwa && \
cp -r dev builds/pwa/release-uuid/app
```

## Potential workflow after updating a lib

Make a modification of an typescript file when you need to update a lib. First try adding a console.log(“k-pop”) in a relevant file such as sync.component.ts, update your lib, then run the `./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev ` .

Look in the relevant file in dev to see if the lib got rebuilt. If you made an update to tangy-form, check polyfills.js. Are you looking at the correct file path? See if main.js was updated as well as polyfills.js and vendor,js. 

Next, run the script in the "Copy files" section to copy these generated build files to the correct location.

If this part of the chain is working, then check the output of the file copy process.

The release-apk.sh scriipt shows the steps when building an APK.
