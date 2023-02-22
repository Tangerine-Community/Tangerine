#!/bin/bash

GROUP="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
T_PROTOCOL="$4"
T_HOST_NAME="$5"
PACKAGE="$6"
APPNAME="$7"
APPNAME_REPLACE="<name>${7}"
BUILD_ID="$8"
VERSION_TAG="$9"
CORDOVA_DIRECTORY="/tangerine/client/builds/apk"
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/apks/$GROUP"
STATUS_FILE="/tangerine/client/releases/$RELEASE_TYPE/apks/$GROUP.json"
URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www"
CHCP_URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www/chcp.json"
DATE=`date '+%Y-%m-%d %H:%M:%S'`
CORDOVA_ANDROID_DIRECTORY="/opt/cordova-android"
ARCHIVE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/apks/archive/$GROUP"

echo "RELEASE APK script started $DATE"

if [ "$2" = "--help" ] || [ "$GROUP" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "$RELEASE_TYPE" = "" ] || [ "$T_PROTOCOL" = "" ] || [ "$T_HOST_NAME" = "" ]; then
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
  echo "  release-apk a4uw93 ./content/groups/group-a qa"
  echo ""
  echo "Then visit https://foo.tangerinecentral.org/releases/qa/apk/a4uw93.apk"
  exit 1
fi

# Mark build status early.
echo '{"processing":true,"step":"Generating APK configuration files"}' > $STATUS_FILE

echo "RELEASE APK: deleting $RELEASE_DIRECTORY"
if [ -d "$RELEASE_DIRECTORY" ]; then
  # Clear out the Cordova project in $RELEASE_DIRECTORY
  rm -rf $RELEASE_DIRECTORY
fi

#if [ -f "/tangerine/groups/$GROUP/package.json" ]; then
#  cd "/tangerine/groups/$GROUP/"
#  npm run install-server && npm run build
#  cd /
#fi

#sleep 10

echo "RELEASE APK: copying cordova dir to release dir"
# Populate with the Cordova project from $CORDOVA_DIRECTORY
cp -R $CORDOVA_DIRECTORY $RELEASE_DIRECTORY

#sleep 10

#echo "RELEASE APK: rm assets dir from $RELEASE_DIRECTORY"
rm -rf $RELEASE_DIRECTORY/www/shell/assets
#sleep 10
#echo "RELEASE APK: Copy content dir to $RELEASE_DIRECTORY"
cp -R $CONTENT_PATH $RELEASE_DIRECTORY/www/shell/assets
#sleep 10
cp /tangerine/logo.svg $RELEASE_DIRECTORY/www/

cd $RELEASE_DIRECTORY

#echo "RELEASE APK: removing cordova-android package symlink"
rm -rf $RELEASE_DIRECTORY/node_modules/cordova-android
rm -rf $RELEASE_DIRECTORY/package-lock.json
#sleep 10
#echo "RELEASE APK: removing client-uploads dir"
rm -rf $RELEASE_DIRECTORY/client-uploads
rm -rf $RELEASE_DIRECTORY/www/shell/assets/client-uploads
#sleep 10
echo "RELEASE APK: removing Android platform"
cordova platform rm android --no-telemetry
#sleep 10
echo "RELEASE APK: Stash the Build ID and other metadata into the release docs"
# Stash the Build ID in the release.
echo $BUILD_ID > $RELEASE_DIRECTORY/www/shell/assets/tangerine-build-id 
echo $VERSION_TAG > $RELEASE_DIRECTORY/www/shell/assets/tangerine-version-tag 
echo $RELEASE_TYPE > $RELEASE_DIRECTORY/www/shell/assets/tangerine-build-channel
echo $PACKAGE > $RELEASE_DIRECTORY/www/shell/assets/tangerine-package-name
echo $T_VERSION > $RELEASE_DIRECTORY/www/shell/assets/tangerine-version

#sleep 10
echo "RELEASE APK: Search and replace text in config.xml"
# replace the URL property in config.xml
sed -e "s#CHCP_URL#"$CHCP_URL"#g" $RELEASE_DIRECTORY/config.xml > tmp;mv -f tmp $RELEASE_DIRECTORY/config.xml
#sleep 10
#echo "RELEASE APK: replace the package id value in config.xml"
sed -e "s#org.rti.tangerine#"$PACKAGE"#g" $RELEASE_DIRECTORY/config.xml > tmp;mv -f tmp $RELEASE_DIRECTORY/config.xml
#sleep 10
#echo "RELEASE APK: replace the app name value in config.xml"
sed -e s#"<name>Tangerine"#"${APPNAME_REPLACE}"#g $RELEASE_DIRECTORY/config.xml > tmp;mv -f tmp $RELEASE_DIRECTORY/config.xml
#echo "RELEASE APK: Copying cordova-hcp.json."
cp /tangerine/client/android-tools/cordova-hot-code-push/cordova-hcp-template.json $RELEASE_DIRECTORY/cordova-hcp.json
#echo "RELEASE APK: replace the URL value in cordova-hcp.json"
sed -e "s#URL#"$URL"#g" $RELEASE_DIRECTORY/cordova-hcp.json > tmp;mv -f tmp $RELEASE_DIRECTORY/cordova-hcp.json
#echo "RELEASE APK: replace the $PACKAGE value in cordova-hcp.json"
sed -e "s#PACKAGE#"$PACKAGE"#g" $RELEASE_DIRECTORY/cordova-hcp.json > tmp;mv -f tmp $RELEASE_DIRECTORY/cordova-hcp.json
#echo "RELEASE APK: replace the $APPNAME value in cordova-hcp.json"
sed -e "s#APPNAME#$APPNAME#g" $RELEASE_DIRECTORY/cordova-hcp.json > tmp;mv -f tmp $RELEASE_DIRECTORY/cordova-hcp.json

echo "RELEASE APK: Create the chcp manifest."
# Create the chcp manifest.
/tangerine/apk-generator/node_modules/cordova-hot-code-push-cli/bin/cordova-hcp build
echo '{"processing":true,"step":"Compiling APK"}' > $STATUS_FILE
#sleep 10
echo "RELEASE APK: adding Android platform"
cordova platform add android@11 --no-telemetry

echo "RELEASE APK: running Cordova build."
cordova build --no-telemetry android

# Copy the apk to the $RELEASE_DIRECTORY
cp $RELEASE_DIRECTORY/platforms/android/app/build/outputs/apk/debug/app-debug.apk $RELEASE_DIRECTORY/$GROUP.apk
# Create Group's archive directory
mkdir -p "$ARCHIVE_DIRECTORY"
# Copy APK to group's archive directory
if [ $T_ARCHIVE_APKS_TO_DISK == true ]; then 
  cp "$RELEASE_DIRECTORY/$GROUP.apk" "$ARCHIVE_DIRECTORY/$GROUP-$VERSION_TAG.apk"
  echo "{\"processing\":false,\"step\":\"APK ready\",\"filepath\":\"archive/$GROUP/$GROUP-$VERSION_TAG.apk\"}" > $STATUS_FILE
  echo "Released apk for $GROUP at $RELEASE_DIRECTORY/$GROUP-$VERSION_TAG.apk on $DATE with Build ID of $BUILD_ID and release type of $RELEASE_TYPE"
else
  echo "{\"processing\":false,\"step\":\"APK ready\",\"filepath\":\"$GROUP/$GROUP.apk\"}" > $STATUS_FILE
  echo "Released apk for $GROUP at $ARCHIVE_DIRECTORY on $DATE with Build ID of $BUILD_ID and release type of $RELEASE_TYPE"
fi

echo 
