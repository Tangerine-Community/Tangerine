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

#cp -r /tangerine/client/builds/apk /.tmp-apk
rm -rf /.tmp-apk/www/content
cp -r $CONTENT_PATH /.tmp-apk/www/content
cp -r ./content/assets /.tmp-apk/www/content

echo "Refreshing the shell - this is dev use only"

rm -rf /.tmp-apk/www/shell
cp -r /tangerine/client/builds/apk/www/shell/ /.tmp-apk/www/shell/
rm -rf /.tmp-apk/www/tangy-forms
#cp -r tangy-forms/dist builds/apk/www/tangy-forms
cp /tangerine/client/tangy-forms/src/index.html /tangerine/client/builds/apk/www/tangy-forms/index.html
cp /tangerine/client/tangy-forms/dist/module.bundle.js /tangerine/client/builds/apk/www/tangy-forms/
cp /tangerine/client/tangy-forms/dist/module.bundle.js.map /tangerine/client/builds/apk/www/tangy-forms/
cp -r /tangerine/client/builds/apk/www/tangy-forms/ /.tmp-apk/www/tangy-forms/

cd /.tmp-apk
echo "RELEASE APK: running Cordova build."
cordova -v --no-telemetry
cordova build --no-telemetry android
#cp /.tmp-apk/platforms/android/app/build/outputs/apk/armv7/debug/app-armv7-debug.apk /tangerine/client/releases/apks/$SECRET.apk
cp /.tmp-apk/platforms/android/app/build/outputs/apk/debug/app-debug.apk /tangerine/client/releases/apks/$SECRET.apk
echo "Released apk for $SECRET"
#rm -r /.tmp-apk
