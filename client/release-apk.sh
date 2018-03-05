#!/bin/bash

SECRET="$1"
CONTENT_PATH="$2"

if [ "$SECRET" = "" ] || [ "$CONTENT_PATH" = "" ]; then
  echo ""
  echo "RELEASE APK"
  echo "A command for releasing an APK using a secret URL."
  echo ""
  echo "./release-apk.sh <secret> <content path>"
  echo ""
  echo "Usage:"
  echo "  ./release-apk.sh a4uw93 ./content/group-a"
  echo ""
  echo "Then visit https://foo.tangerinecentral.org/releases/apk/a4uw93.apk"
fi

cp -r /tangerine/client/builds/apk /.tmp-apk
cp -r $CONTENT_PATH /.tmp-apk/www/content

cd /.tmp-apk
echo "RELEASE APK: running Cordova build."
#cordova build -- --gradleArg=-PcdvBuildArch=arm android 2>&1
cordova platform --no-telemetry add android@6.3.0
cordova plugin --no-telemetry add cordova-plugin-whitelist --save
cordova plugin --no-telemetry add cordova-plugin-geolocation --save
cordova plugin --no-telemetry add cordova-plugin-camera --save
cordova plugin --no-telemetry add cordova-plugin-crosswalk-webview --save
cordova -v --no-telemetry
cordova build --no-telemetry android
cp /.tmp-apk/platforms/android/build/outputs/apk/android-armv7-debug.apk /tangerine/client/releases/apks/$SECRET.apk
echo "Released apk for $SECRET"
rm -r /.tmp-apk
