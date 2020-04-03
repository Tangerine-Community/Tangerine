# How Tangerine is built

When the develop.sh script is run, the Dockerfile builds tangerine into dist/tangerine-client and copies the built code into builds/apk/www/shell and builds/pwa/release-uuid/app. 

If you modify an angular file, its output is sent to the dev directory. If you need to make an apk using the updated code, run the following script:

```javascript
cd /tangerine/client && \
rm -rf builds/apk/www/shell && \
rm -rf builds/pwa/release-uuid/app && \
cp -r dev builds/apk/www/shell && \
cp -r pwa-tools/updater-app/build/default builds/pwa && \
cp -r dev builds/pwa/release-uuid/app
```

