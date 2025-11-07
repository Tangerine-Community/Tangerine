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

RELEASES_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/"

# First, make sure the latest online survey app dist is set up -- TODO add release versions
ONLINE_SURVEY_APP_DIRECTORY="$RELEASES_DIRECTORY/online-survey-app"
cp -r /tangerine/online-survey-app/dist/online-survey-app/ $ONLINE_SURVEY_APP_DIRECTORY

# Create the release online survey app directory for the group
GROUP_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/online-survey-apps/$GROUP_ID"
mkdir -p $GROUP_DIRECTORY
RELEASE_DIRECTORY="$GROUP_DIRECTORY/$FORM_ID"

FORM_CLIENT_DIRECTORY="/tangerine/groups/$GROUP_ID/client"
FORM_DIRECTORY="$FORM_CLIENT_DIRECTORY/$FORM_ID"
LOCATION_LIST_PATH="$FORM_CLIENT_DIRECTORY/location-list.json"
LOCATION_LISTS_DIRECTORY="$FORM_CLIENT_DIRECTORY/locations"
MEDIA_DIRECTORY="$FORM_CLIENT_DIRECTORY/media"
CUSTOM_SCRIPTS="$FORM_CLIENT_DIRECTORY/custom-scripts.js"
CUSTOM_SCRIPTS_MAP="$FORM_CLIENT_DIRECTORY/custom-scripts.js.map"
CUSTOM_LOGIN_MARKUP="$FORM_CLIENT_DIRECTORY/custom-login-markup.html"

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

if [ -f "/tangerine/groups/$GROUP_ID/package.json" ]; then
  cd "/tangerine/groups/$GROUP_ID/"
  npm run install-server && npm run build
  cd /
fi

FORM_UPLOAD_URL="/onlineSurvey/saveResponse/$GROUP_ID/$FORM_ID"

if [[ $REQUIRE_ACCESS_CODE == 'true' ]]; then
  REQUIRE_ACCESS_CODE="true"
else
  REQUIRE_ACCESS_CODE="false"
fi

# NOTE: App Config does NOT come from the app-config.json file in the release directory
# Copy template online-survey-app app-config file
cp -r /tangerine/online-survey-app/src/assets/app-config.json $RELEASE_DIRECTORY/assets/app-config.json

sed -i -e "s#GROUP_ID#"$GROUP_ID"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#FORM_UPLOAD_URL#"$FORM_UPLOAD_URL"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#UPLOAD_KEY#"$UPLOAD_KEY"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#APP_NAME#"$APP_NAME"#g" $RELEASE_DIRECTORY/assets/app-config.json
sed -i -e "s#REQUIRE_ACCESS_CODE#"$REQUIRE_ACCESS_CODE"#g" $RELEASE_DIRECTORY/assets/app-config.json

# copy the HELP_LINK from client/app-config.json to assets/app-config.json
HELP_LINK=$(jq -r '.helpLink' $FORM_CLIENT_DIRECTORY/app-config.json)
if [ "$HELP_LINK" = "null" ]; then
  HELP_LINK=""
fi
jq '.helpLink = "'$HELP_LINK'"' $RELEASE_DIRECTORY/assets/app-config.json > tmp.$$.json && mv tmp.$$.json $RELEASE_DIRECTORY/assets/app-config.json

echo "Release to $RELEASE_DIRECTORY in $RELEASE_TYPE channel"
