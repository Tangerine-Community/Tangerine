#!/bin/bash

GROUP="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
RELEASE_DIRECTORY="/tangerine/client/releases/$RELEASE_TYPE/dat/$GROUP"

echo "RELEASE_DIRECTORY: $RELEASE_DIRECTORY"

if [ "$GROUP" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "$RELEASE_TYPE" = "" ]; then
  echo ""
  echo "RELEASE PWA"
  echo "A command for releasing a PWA using a secret URL."
  echo ""
  echo "./release-dat.sh <secret> <content path> <release type>"
  echo ""
  echo "Release type is either qa or prod."
  echo ""
  echo "Usage:"
  echo "  ./release-dat.sh a4uw93 ./content/groups/group-a prod"
  echo ""
  echo "Then visit https://foo.tanerinecentral.org/dat/a4uw93/"
  echo ""
  echo ""
  exit
fi
 q
# Create a temporary PWA folder that we'll move to the secret.
cp -r builds/dat .dat-temporary

# Install content into PWA.
rm -r .dat-temporary/$UUID/content
cp -r $CONTENT_PATH .dat-temporary/$UUID/content

# Add logo.
cp .dat-temporary/logo.svg .dat-temporary/$UUID/

rm -r $RELEASE_DIRECTORY
mv .dat-temporary $RELEASE_DIRECTORY
echo "Release with UUID of $UUID to $RELEASE_DIRECTORY"
