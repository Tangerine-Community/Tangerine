#!/bin/bash

SECRET="$1"
CONTENT_PATH="$2"

if [ "$SECRET" = "" ] || [ "$CONTENT_PATH" = "" ]; then
  echo ""
  echo "RELEASE PWA"
  echo "A command for releasing a PWA using a secret URL."
  echo ""
  echo "./release-pwa.sh <secret> <content path>"
  echo ""
  echo "Usage:"
  echo "  ./release-pwa.sh a4uw93 /tangerine-server/data/content/group-a"
  echo ""
  echo "Then visit https://foo.tanerinecentral.org/pwa/a4uw93/"
  echo ""
  echo ""
  exit
fi

# Set node version.
source ~/.nvm/nvm.sh
nvm use 8

# Create a temporary PWA folder that we'll move to the secret.
cp -r builds/pwa .pwa-temporary 

# Install content into PWA.
rm -r .pwa-temporary/content
cp -r $CONTENT_PATH .pwa-temporary/content

# Generate service worker.
./node_modules/.bin/workbox generate:sw

# Generate release UUID and name the service worker after it.
UUID=$(./node_modules/.bin/uuid)
mv .pwa-temporary/sw.js .pwa-temporary/$UUID.js
echo $UUID > .pwa-temporary/release-uuid.txt
echo "Release with UUID of $UUID"

# Move our release ready PWA to it's secret spot.
rm -r releases/pwas/$SECRET
mv .pwa-temporary releases/pwas/$SECRET
