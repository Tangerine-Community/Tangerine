#!/bin/bash

SECRET="$1"
CONTENT_PATH="$2"
QA_DIRECTORY="/tangerine/client/QA/apks/$SECRET"
RELEASES_DIRECTORY="/tangerine/client/releases/apks/$SECRET"

if [ "$SECRET" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "QA_DIRECTORY" = "" ] || [ "RELEASES_DIRECTORY" = "" ]; then
  echo ""
  echo "RELEASE APK"
  echo "A command for releasing an APK using a secret URL."
  echo ""
  echo "./release-apk.sh <secret> <content path>"
  echo ""
  echo "Usage:"
  echo "  ./release-apk.sh a4uw93 ./content/groups/group-a"
  echo ""
  echo "Then visit https://foo.tangerinecentral.org/releases/apk/a4uw93.apk"
fi

# if [ ! -d "$QA_DIRECTORY" ]; then
  # seed with Cordova project from /cordova_base if $QA_DIRECTORY doesn't exist.
  cp -R /cordova_base $QA_DIRECTORY
# fi

rm -rf $QA_DIRECTORY/www/content
cp -r $CONTENT_PATH $QA_DIRECTORY/www/content
cp -r ./content/assets $QA_DIRECTORY/www/content

echo "Refreshing the shell - this is dev use only"

rm -rf $QA_DIRECTORY/www/shell
cp -r /tangerine/client/builds/apk/www/shell/ $QA_DIRECTORY/www/shell/
rm -rf $QA_DIRECTORY/www/tangy-forms
#cp -r tangy-forms/dist builds/apk/www/tangy-forms
cp /tangerine/client/tangy-forms/src/index.html /tangerine/client/builds/apk/www/tangy-forms/index.html
cp /tangerine/client/tangy-forms/dist/module.bundle.js /tangerine/client/builds/apk/www/tangy-forms/
cp /tangerine/client/tangy-forms/dist/module.bundle.js.map /tangerine/client/builds/apk/www/tangy-forms/
cp -r /tangerine/client/builds/apk/www/tangy-forms/ $QA_DIRECTORY/www/tangy-forms/

cd $QA_DIRECTORY
echo "RELEASE APK: running Cordova build."
cordova -v --no-telemetry
cordova build --no-telemetry android
if [ ! -d "$RELEASES_DIRECTORY" ]; then
# mkdir if $RELEASES_DIRECTORY doesn't exist.
    mkdir $RELEASES_DIRECTORY
else
    rm -r $RELEASES_DIRECTORY/www
fi

echo "Copying www and cordova-hcp.json $RELEASES_DIRECTORY"
cp -R $QA_DIRECTORY/www $RELEASES_DIRECTORY/www
cp -R $QA_DIRECTORY/cordova-hcp.json $RELEASES_DIRECTORY/cordova-hcp.json

cp $QA_DIRECTORY/platforms/android/app/build/outputs/apk/debug/app-debug.apk $RELEASES_DIRECTORY/$SECRET.apk

echo "Released apk for $SECRET at $RELEASES_DIRECTORY"

