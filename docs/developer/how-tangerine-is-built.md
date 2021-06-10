# How Tangerine code is generated

When the develop.sh script is run, the Dockerfile builds tangerine into dist/tangerine-client and copies the built code into builds/apk/www/shell and builds/pwa/release-uuid/app. 

When Dockerfile is complete, it runs entrypoint-development.sh and watches for changes, sending its output to the dev directory:

```
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev &
```

If you need to make an apk using the updated code, run the following script:

```javascript
cd /tangerine/client && \
rm -rf builds/apk/www/shell && \
rm -rf builds/pwa/release-uuid/app && \
cp -r dev builds/apk/www/shell && \
cp -r pwa-tools/updater-app/build/default builds/pwa && \
cp -r dev builds/pwa/release-uuid/app
```

If you need to refresh one of the dependent libraries:

```javascript
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev
```

Then run the code above to copy the files in the dev dir over.

