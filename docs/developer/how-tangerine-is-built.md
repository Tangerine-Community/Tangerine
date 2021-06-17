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

In this workflow, you're testing changes to a library such as tangy-form. Make these changes inside the container in the node_modules directory for your library. 

Run `./node_modules/.bin/ng build --base-href ./ --output-path ./dev  ` inside the client dir in the container. It will rebuild all of the libs.

(Note that each time you run the `ng build` script above it removes the dev directory before building. This may cause problems when you try to list files in that directory. Do a `cd .. & cd dev & ls -ls` and all will be good.)

Next, run the script in the "Copy files" section to copy these generated build files to the correct location.

If this part of the chain is working, then check the output of the file copy process. 

If all is good, release a new APK from the Tangerine UI.

## Tips

The release-apk.sh script shows the steps when building an APK.
