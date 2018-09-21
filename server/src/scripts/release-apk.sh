#!/bin/bash



set -x

if [ -f /release-apk.lock ]; then
  echo "Another APK is being generated."
  exit 1
fi
touch /release-apk.lock

GROUP="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
T_PROTOCOL="$4"
T_HOST_NAME="$5"
CORDOVA_DIRECTORY="/tangerine/client/builds/apk"
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/apks/$GROUP"
URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www"
CHCP_URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www/chcp.json"
DATE=`date '+%Y-%m-%d %H:%M:%S'`

echo "RELEASE APK script started $DATE"

if [ "$GROUP" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "$RELEASE_TYPE" = "" ] || [ "$T_PROTOCOL" = "" ] || [ "$T_HOST_NAME" = "" ]; then
  echo ""
  echo "RELEASE APK"
  echo "A command for releasing an APK using a group URL."
  echo ""
  echo "./release-apk.sh <group> <content path> <release type> <protocol> <hostname>"
  echo ""
  echo "Release type is either qa or prod."
  echo ""
  echo "<protocol> <hostname> are for the update URL"
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
rm -rf $RELEASE_DIRECTORY/www/shell/assets
cp -r $CONTENT_PATH $RELEASE_DIRECTORY/www/shell/assets
cp /tangerine/logo.svg $RELEASE_DIRECTORY/www/

cd $RELEASE_DIRECTORY

# replace the URL property in config.xml
sed -i -e "s#CHCP_URL#"$CHCP_URL"#g" $RELEASE_DIRECTORY/config.xml

echo "Copying cordova-hcp.json $RELEASE_DIRECTORY"
cp /tangerine/client/wrappers/apk/cordova-hcp-template.json $RELEASE_DIRECTORY/cordova-hcp.json
sed -i -e "s#URL#"$URL"#g" $RELEASE_DIRECTORY/cordova-hcp.json

# Create the chcp manifest.
/tangerine/server/node_modules/cordova-hot-code-push-cli/bin/cordova-hcp build

pwd
echo "RELEASE APK: running Cordova build."
cordova build --no-telemetry android

# Copy the apk to the $RELEASE_DIRECTORY
cp $RELEASE_DIRECTORY/platforms/android/app/build/outputs/apk/debug/app-debug.apk $RELEASE_DIRECTORY/$GROUP.apk
echo "Released apk for $GROUP at $RELEASE_DIRECTORY on $DATE"

rm /release-apk.lock
