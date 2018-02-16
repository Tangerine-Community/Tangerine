#!/bin/bash

GROUP="$1"
CONTENT_PATH="$2"

if [ "$GROUP" = "" ] || [ "$CONTENT_PATH" = "" ]; then
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
mkdir .pwa-temporary releases/pwas/$GROUP
cp wrappers/pwa/redirect-to-current-release.html releases/pwas/$GROUP/index.html
mv .pwa-temporary releases/pwas/$GROUP/$UUID
echo $UUID > releases/pwas/$GROUP/release-uuid.txt
echo "Release with UUID of $UUID"
