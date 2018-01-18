#!/bin/bash
set -x

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
  echo "  ./release-apk.sh a4uw93 /tangerine-server/data/content/group-a"
  echo ""
  echo "Then visit https://foo.tanerinecentral.org/apk/a4uw93.apk"
fi


# Set node version.
source ~/.nvm/nvm.sh && \
nvm use 4

# Move aside v2 client code in Android project.
mv ../client/www ../client/www-tmp
cp -r ../client-v3/builds/apk ../client/www
# @TODO COPY CONTENT PATH

# APK build.
cd ../client
./node_modules/.bin/cordova build android

# Put v2 client back.
rm -r ./www
mv www-tmp www

mv platforms/android/build/outputs/apk/android-armv7-debug.apk ../client-v3/releases/apks/$SECRET.apk
