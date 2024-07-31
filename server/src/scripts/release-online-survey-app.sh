#!/bin/bash

GROUP_ID="$1"
FORM_ID="$2"
RELEASE_TYPE="$3"
APP_NAME=$(echo "$4" | sed "s/ /_/g") # sanitize spaces in app name
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

# Create the release online survey app directory for the group
GROUP_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/online-survey-apps/$GROUP_ID"
mkdir -p $GROUP_DIRECTORY

# Ensure the release directory does not exist
RELEASE_DIRECTORY="$GROUP_DIRECTORY/$FORM_ID"
rm -r $RELEASE_DIRECTORY

FORM_CLIENT_DIRECTORY="/tangerine/groups/$GROUP_ID/client"
FORM_DIRECTORY="$FORM_CLIENT_DIRECTORY/$FORM_ID"
LOCATION_LIST_PATH="$FORM_CLIENT_DIRECTORY/location-list.json"
LOCATION_LISTS_DIRECTORY="$FORM_CLIENT_DIRECTORY/locations"
MEDIA_DIRECTORY="$FORM_CLIENT_DIRECTORY/media"

# Set up the release dir from the dist
cp -r /tangerine/online-survey-app/dist/online-survey-app/ $RELEASE_DIRECTORY

# Ensure the release directories exists
mkdir -p $RELEASE_DIRECTORY/assets/locations
mkdir -p $RELEASE_DIRECTORY/assets/media

# Copy the form, location list, and media to the release directory
cp $FORM_DIRECTORY/*.html $RELEASE_DIRECTORY/assets/form/
cp $LOCATION_LIST_PATH $RELEASE_DIRECTORY/assets/
cp -r $LOCATION_LISTS_DIRECTORY $RELEASE_DIRECTORY/assets/
cp -r $MEDIA_DIRECTORY $RELEASE_DIRECTORY/assets/
cp /tangerine/translations/*.json $RELEASE_DIRECTORY/assets/

FORM_UPLOAD_URL="/onlineSurvey/saveResponse/$GROUP_ID/$FORM_ID"

# NOTE: App Config does NOT come from the app-config.json file in the release directory
sed -i -e "s#GROUP_ID#"$GROUP_ID"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#FORM_UPLOAD_URL#"$FORM_UPLOAD_URL"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#UPLOAD_KEY#"$UPLOAD_KEY"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#APP_NAME#"$APP_NAME"#g" $RELEASE_DIRECTORY/assets/app-config.json

echo "Release with UUID of $UUID to $RELEASE_DIRECTORY with Build ID of $BUILD_ID, channel of $RELEASE_TYPE"
