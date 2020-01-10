# Cordova plugin development

## Getting started

It is a lot easier to build a cordova plugin for Tangerine using a generic Cordova project instead of developing directly in Tangerine, because in Tangerine access to the actual client Cordova code is hidden away in /tangerine/client/builds/apk. So first use the cordova cli to generate a new project.

## Refreshing your new plugin in your Cordova project

After making modifications to the plugin, rm and add the plugin and the cordova android platform before building.

```javascript
cordova plugin rm cordova-plugin-nearby-connections
cordova platform rm android
cordova platform add android@8
cordova plugin add ../../Tangerine-Community/cordova-plugin-nearby-connections
cordova build android
```

## Updating the cordova plugin inside Tangerine

After your done the bulk of your Cordova development, you will need to modify the docker-tangerine-base-image to include the new plugin. After updating the base image, don't forget to update the Dockerfile. 

Sometimes you may need to view an update to the plugin but you don't want to go to the trouble of updating the base image. It is possible to work on the plugin code and then refresh the code in Tangerine. First you will need to share the source code with your docker instance Add the following to develop.sh:

```
  --volume $(pwd)/../cordova-plugin-nearby-connections:/tangerine/client/cordova-plugin-nearby-connections \
```

Once your container has started, docker exec into it, and run the following:

```javascript
cd /tangerine/client/builds/apk
cordova plugin rm cordova-plugin-nearby-connections
cordova plugin add ../../cordova-plugin-nearby-connections --save
```
Sometimes cordova can have issues with cleaning the build; here's a way to make sure you have the updated code:
```javascript
cd /tangerine/client/builds/apk
cordova plugin rm cordova-plugin-nearby-connections
cordova platform rm android
cordova platform add android@8
cordova plugin add ../../cordova-plugin-nearby-connections --save
cordova build android
```

## Updating Angular client code used in the APK

IF you're developing Cordova plugins for Tangerine and make changes to the Angular client code that is displayed in the apk, 
you will need to refresh the apk build. First generate a pwa. Then run the following code:

```javascript
cd /tangerine/client && \
rm -rf builds/apk/www/shell && \
rm -rf builds/pwa/release-uuid/app && \
cp -r dev builds/apk/www/shell && \
cp -r pwa-tools/updater-app/build/default builds/pwa && \
cp -r dev builds/pwa/release-uuid/app
```

Then generate the apk.

To check if it worked, you can search for the new code in these files:

```javascript
vi builds/apk/www/shell/main.js
vi builds/pwa/release-uuid/app/main.js
```

T0 uninstall and re-install the apk:

```javascript
adb uninstall org.rti.tangerine
adb install qa/apks/group-long-uuisd/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

