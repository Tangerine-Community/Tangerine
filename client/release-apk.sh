#!/bin/bash

SECRET="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
T_PROTOCOL="$4"
T_UPLOAD_USER="$5"
T_UPLOAD_PASSWORD="$6"
T_HOST_NAME="$7"
CORDOVA_DIRECTORY="/tangerine/client/builds/apk"
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/apks/$SECRET"
URL="$T_PROTOCOL://$T_UPLOAD_USER:$T_UPLOAD_PASSWORD@$T_HOST_NAME/releases/prod/apks/$SECRET"

echo "URL: $URL"

if [ "$SECRET" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "$RELEASE_TYPE" = "" ] || [ "$T_PROTOCOL" = "" ] || [ "$T_UPLOAD_USER" = "" ] || [ "$T_UPLOAD_PASSWORD" = "" ] || [ "$T_HOST_NAME" = "" ]; then
  echo ""
  echo "RELEASE APK"
  echo "A command for releasing an APK using a secret URL."
  echo ""
  echo "./release-apk.sh <secret> <content path> <release type> <protocol> <uploadUser> <password> <hostname>"
  echo ""
  echo "Release type is either qa or prod."
  echo ""
  echo "<protocol> <uploadUser> <password> <hostname> are for the update URL"
  echo ""
  echo "Usage:"
  echo "  ./release-apk.sh a4uw93 ./content/groups/group-a qa"
  echo ""
  echo "Then visit https://foo.tangerinecentral.org/releases/qa/apk/a4uw93.apk"
  exit 1
fi

if [ -d "$RELEASE_DIRECTORY" ]; then
  # Clear out the Cordova project in $CORDOVA_DIRECTORY
  rm -rf $RELEASE_DIRECTORY
fi

# Populate with the Cordova project from $CORDOVA_DIRECTORY
cp -r $CORDOVA_DIRECTORY $RELEASE_DIRECTORY

# Refresh the content dir in $RELEASE_DIRECTORY
rm -rf $RELEASE_DIRECTORY/www/content
cp -r $CONTENT_PATH $RELEASE_DIRECTORY/www/content

cd $RELEASE_DIRECTORY
echo "RELEASE APK: running Cordova build."

cordova build --no-telemetry android

if [ "$RELEASE_TYPE" = "prod" ]; then

    echo "Copying cordova-hcp.json $RELEASE_DIRECTORY"

    cp /tangerine/client/tangy-forms/editor/cordova-hcp-template.json $RELEASE_DIRECTORY/cordova-hcp.json
    sed -i -e "s#URL#"$URL"#g" $RELEASE_DIRECTORY/cordova-hcp.json
fi

cp $RELEASE_DIRECTORY/platforms/android/app/build/outputs/apk/debug/app-debug.apk $RELEASE_DIRECTORY/$SECRET.apk

echo "Released apk for $SECRET at $RELEASE_DIRECTORY"

