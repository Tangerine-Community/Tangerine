#!/bin/bash

#shopt -s expand_aliases
#import ../../node_modules/bash-oo-framework/lib/util/tryCatch
#import /tangerine/server/node_modules/bash-oo-framework/lib/util/tryCatch
#import ../../node_modules/bash-oo-framework/lib/util/exception # needed only for Exception::PrintException
#/tangerine/server/src/utils/bash-oo-framework/bootstrap-bash-oo-framework.sh
#/tangerine/server/src/utils/bash-oo-framework/lib/oo-bootstrap.sh
#echo "starting import"
#import util/tryCatch
#__oo__allowFileReloading=false System::Import util/tryCatch
#echo "ending import"

GROUP="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
T_PROTOCOL="$4"
T_HOST_NAME="$5"
PACKAGE="$6"
APPNAME="$7"
APPNAME_REPLACE="<name>${7}"
CORDOVA_DIRECTORY="/tangerine/client/builds/apk"
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/apks/$GROUP"
STATUS_FILE="/tangerine/client/releases/$RELEASE_TYPE/apks/$GROUP.json"
URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www"
CHCP_URL="$T_PROTOCOL://$T_HOST_NAME/releases/$RELEASE_TYPE/apks/$GROUP/www/chcp.json"
DATE=`date '+%Y-%m-%d %H:%M:%S'`
BUILD_ID=`uuid`
CORDOVA_ANDROID_DIRECTORY="/opt/cordova-android"

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

if [ -d "$RELEASE_DIRECTORY" ]; then
  # Clear out the Cordova project in $RELEASE_DIRECTORY
  rm -rf $RELEASE_DIRECTORY
fi

# Populate with the Cordova project from $CORDOVA_DIRECTORY
cp -r $CORDOVA_DIRECTORY $RELEASE_DIRECTORY

# Refresh the content dir in $RELEASE_DIRECTORY
rm -rf $RELEASE_DIRECTORY/www/shell/assets
cp -r $CONTENT_PATH $RELEASE_DIRECTORY/www/shell/assets
cp /tangerine/logo.svg $RELEASE_DIRECTORY/www/

cd $RELEASE_DIRECTORY

echo "RELEASE APK: removing cordova-android package symlink"
rm -rf $RELEASE_DIRECTORY/node_modules/cordova-android
rm -rf $RELEASE_DIRECTORY/package-lock.json

echo "RELEASE APK: removing Android platform"
cordova platform rm android --no-telemetry

CUSTOM_SCRIPTS_PATH="$RELEASE_DIRECTORY/www/shell/assets/custom-scripts.js"
TMP_CUSTOM_SCRIPTS_PATH="$CUSTOM_SCRIPTS_PATH.tmp"
if [ -f "$CUSTOM_SCRIPTS_PATH" ]; then
#  try {
  echo "RELEASE APK webpacking CUSTOM_SCRIPTS"
  webpack $CUSTOM_SCRIPTS_PATH -o $TMP_CUSTOM_SCRIPTS_PATH
  cp "$TMP_CUSTOM_SCRIPTS_PATH/main.js" $CUSTOM_SCRIPTS_PATH
  # remove the following error test line
#  mv $TMP_CUSTOM_SCRIPTS_PATH $CUSTOM_SCRIPTS_PATH 
#  } catch {
#    echo "ERROR! "
#    echo "Caught Exception:$(UI.Color.Red) $__BACKTRACE_COMMAND__ $(UI.Color.Default)"
#    echo "File: $__BACKTRACE_SOURCE__, Line: $__BACKTRACE_LINE__"
#
#    ## printing a caught exception couldn't be simpler, as it's stored in "${__EXCEPTION__[@]}"
##    Exception::PrintException "${__EXCEPTION__[@]}"
#  }
fi

# Stash the Build ID in the release.
echo $BUILD_ID > $RELEASE_DIRECTORY/www/shell/assets/tangerine-build-id 
echo $RELEASE_TYPE > $RELEASE_DIRECTORY/www/shell/assets/tangerine-build-channel
echo $PACKAGE > $RELEASE_DIRECTORY/www/shell/assets/tangerine-package-name

# replace the URL property in config.xml
sed -i -e "s#CHCP_URL#"$CHCP_URL"#g" $RELEASE_DIRECTORY/config.xml

# replace the package id value in config.xml
sed -i -e "s#org.rti.tangerine#"$PACKAGE"#g" $RELEASE_DIRECTORY/config.xml

# replace the app name value in config.xml
sed -i -e s#"<name>Tangerine"#"${APPNAME_REPLACE}"#g $RELEASE_DIRECTORY/config.xml

echo "Copying cordova-hcp.json $RELEASE_DIRECTORY"
cp /tangerine/client/android-tools/cordova-hot-code-push/cordova-hcp-template.json $RELEASE_DIRECTORY/cordova-hcp.json
sed -i -e "s#URL#"$URL"#g" $RELEASE_DIRECTORY/cordova-hcp.json
sed -i -e "s#PACKAGE#"$PACKAGE"#g" $RELEASE_DIRECTORY/cordova-hcp.json
sed -i -e "s#APPNAME#$APPNAME#g" $RELEASE_DIRECTORY/cordova-hcp.json

# Create the chcp manifest.
/tangerine/server/node_modules/cordova-hot-code-push-cli/bin/cordova-hcp build
echo '{"processing":true,"step":"Compiling APK"}' > $STATUS_FILE

echo "RELEASE APK: adding Android platform"
cordova platform add $CORDOVA_ANDROID_DIRECTORY --no-telemetry

echo "RELEASE APK: running Cordova build."
cordova build --no-telemetry android

# Copy the apk to the $RELEASE_DIRECTORY
cp $RELEASE_DIRECTORY/platforms/android/app/build/outputs/apk/debug/app-debug.apk $RELEASE_DIRECTORY/$GROUP.apk

echo '{"processing":false,"step":"APK ready"}' > $STATUS_FILE
echo 
echo "Released apk for $GROUP at $RELEASE_DIRECTORY on $DATE with Build ID of $BUILD_ID and release type of $RELEASE_TYPE"
