#!/bin/bash

GROUP_ID="$1"
FORM_ID="$2"
RELEASE_TYPE="$3"
APP_NAME=$(echo "$4" | sed "s/ /_/g") # sanitize spaces in app name
UPLOAD_KEY="$5"
REQUIRE_ACCESS_CODE="$6"

if [ "$2" = "--help" ] || [ "$GROUP_ID" = "" ] || [ "$FORM_ID" = "" ] || [ "$RELEASE_TYPE" = "" ]; then
  echo ""
  echo "RELEASE Online Survey App"
  echo "A command for releasing the Online Survey App for a specific form in a group."
  echo ""
  echo "./release-online-survey-app.sh <groupId> <formId> <releaseType> <appName> <uploadKey> [requireAccessCode]"
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
CUSTOM_SCRIPTS="$FORM_CLIENT_DIRECTORY/custom-scripts.js"
CUSTOM_SCRIPTS_MAP="$FORM_CLIENT_DIRECTORY/custom-scripts.js.map"
CUSTOM_LOGIN_MARKUP="$FORM_CLIENT_DIRECTORY/custom-login-markup.html"
APP_CONFIG="$FORM_CLIENT_DIRECTORY/app-config.json"

# Set up the release dir from the dist
cp -r /tangerine/online-survey-app/dist/online-survey-app/ $RELEASE_DIRECTORY

# Ensure the release directories exists
mkdir -p $RELEASE_DIRECTORY/assets
mkdir -p $RELEASE_DIRECTORY/assets/form
mkdir -p $RELEASE_DIRECTORY/assets/locations
mkdir -p $RELEASE_DIRECTORY/assets/media

# Copy the form, location list, and media to the release directory
cp -r $FORM_DIRECTORY/*.html $RELEASE_DIRECTORY/assets/form/
cp $LOCATION_LIST_PATH $RELEASE_DIRECTORY/assets/
cp -r $LOCATION_LISTS_DIRECTORY $RELEASE_DIRECTORY/assets/
cp -r $MEDIA_DIRECTORY $RELEASE_DIRECTORY/assets/
cp /tangerine/translations/*.json $RELEASE_DIRECTORY/assets/
cp $CUSTOM_SCRIPTS $RELEASE_DIRECTORY/assets/
cp $CUSTOM_SCRIPTS_MAP $RELEASE_DIRECTORY/assets/
cp $CUSTOM_LOGIN_MARKUP $RELEASE_DIRECTORY/assets/

CASE_DEFINITIONS="$FORM_CLIENT_DIRECTORY/case-definitions.json"
echo "CASE_DEFINITIONS: $CASE_DEFINITIONS"
if [ -f "$CASE_DEFINITIONS" ]; then
  echo "Found case definitions"
  cp $CASE_DEFINITIONS $RELEASE_DIRECTORY/assets/
  # read the case definitions and add the files to the release directory
  while IFS= read -r line
  do
    # if the line contains "src" then it is a file to copy
    if [[ $line != *"src"* ]]; then
      continue
    fi
    # line is like: "src": "./assets/parent-of-child-6-7-case.json"
    # strip the file name
    line=$(echo $line | sed 's/"src": ".\/assets\///g' | sed 's/"//g')
    cp $FORM_CLIENT_DIRECTORY/$line $RELEASE_DIRECTORY/assets/
  done < $CASE_DEFINITIONS
fi

if [ -f "/tangerine/groups/$GROUP/package.json" ]; then
  cd "/tangerine/groups/$GROUP/"
  npm run install-server && npm run build
  cd /
fi

FORM_UPLOAD_URL="/onlineSurvey/saveResponse/$GROUP_ID/$FORM_ID"

if [[ $REQUIRE_ACCESS_CODE == 'true' ]]; then
  REQUIRE_ACCESS_CODE="true"
else
  REQUIRE_ACCESS_CODE="false"
fi

# Copy the app-config.json to the release directory
cp $APP_CONFIG $RELEASE_DIRECTORY/assets/

# first delete the last line of the file with the closing bracket
sed -i '$ d' $RELEASE_DIRECTORY/assets/app-config.json

#append a comma to the end of the last line
sed -i '$ s/$/,/' $RELEASE_DIRECTORY/assets/app-config.json

#then append the online survey configs
echo "\"formUploadURL\": \"$FORM_UPLOAD_URL\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"uploadKey\": \"$UPLOAD_KEY\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"groupId\": \"$GROUP_ID\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"languageDirection\": \"ltr\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"languageCode\": \"en\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"appName\": \"$APP_NAME\"," >> $RELEASE_DIRECTORY/assets/app-config.json
echo "\"requireAccessCode\": $REQUIRE_ACCESS_CODE" >> $RELEASE_DIRECTORY/assets/app-config.json

# finaly, add the closing bracket
echo "}" >> $RELEASE_DIRECTORY/assets/app-config.json

echo "Release with UUID of $UUID to $RELEASE_DIRECTORY with Build ID of $BUILD_ID, channel of $RELEASE_TYPE"
