#!/bin/bash

GROUP_ID="$1"
FORM_ID="$2"
RELEASE_TYPE="$3"
APP_NAME="$4"
UPLOAD_KEY="$5"

if [ "$2" = "--help" ] || [ "$GROUP_ID" = "" ] || [ "$FORM_ID" = "" ] || [ "$RELEASE_TYPE" = "" ]; then
  echo ""
  echo "RELEASE Online Survey App"
  echo "A command for releasing the Online Survey App for a specific form in a group."
  echo ""
  echo "./release-online-survey-app.sh <groupId> <formId> <releaseType> <appName> <uploadKey>"
  echo ""
  echo "Release type is either qa or prod."
  echo ""
  echo "Usage:"
  echo "  ./release-online-survey-app.sh group-e6d8abfc-0034-4efd-8c79-00e0469c59b4 form-1234 prod \"Frank's Form\" upload1234"
  echo ""
  echo "Then visit https://foo.tanerinecentral.org/releases/prod/online-survey-apps/group-e6d8abfc-0034-4efd-8c79-00e0469c59b4/form-1234/"
  echo ""
  echo ""
  exit
fi

mkdir /tangerine/client/releases/$RELEASE_TYPE/
mkdir /tangerine/client/releases/$RELEASE_TYPE/online-survey-apps
mkdir /tangerine/client/releases/$RELEASE_TYPE/online-survey-apps/$GROUP_ID
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/online-survey-apps/$GROUP_ID/$FORM_ID"

echo $RELEASE_DIRECTORY

rm -r $RELEASE_DIRECTORY


FORM_CLIENT_DIRECTORY="/tangerine/groups/$GROUP_ID/client/"
FORM_DIRECTORY="$FORM_CLIENT_DIRECTORY/$FORM_ID"
LOCATION_LIST_PATH="$FORM_CLIENT_DIRECTORY/location-list.json"

# Set up the release dir from the dist
cp -r /tangerine/online-survey-app/dist/online-survey-app/ $RELEASE_DIRECTORY

# Copy the full contents of the client directory to the assets folder in the release
# Includes translations, media and any files added by the renderer and used by the forms
cp -r $FORM_CLIENT_DIRECTORY/* $RELEASE_DIRECTORY/assets/
# Rename the form folder to 'form' (required to load the form properly)
mv $RELEASE_DIRECTORY/$FORM_ID $RELEASE_DIRECTORY/assets/form

FORM_UPLOAD_URL="/onlineSurvey/saveResponse/$GROUP_ID/$FORM_ID"

sed -i -e "s#GROUP_ID#"$GROUP_ID"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#FORM_UPLOAD_URL#"$FORM_UPLOAD_URL"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#UPLOAD_KEY#"$UPLOAD_KEY"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#APP_NAME#"$APP_NAME"#g" $RELEASE_DIRECTORY/assets/app-config.json

echo "Release with UUID of $UUID to $RELEASE_DIRECTORY with Build ID of $BUILD_ID, channel of $RELEASE_TYPE"
