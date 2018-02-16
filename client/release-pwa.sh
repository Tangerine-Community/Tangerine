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

# Generate release UUID and name the service worker after it.
UUID=$(./node_modules/.bin/uuid)
mv .pwa-temporary/release-uuid .pwa-temporary/$UUID

# Install content into PWA.
rm -r .pwa-temporary/$UUID/content
cp -r $CONTENT_PATH .pwa-temporary/$UUID/content

# Generate service worker.
./node_modules/.bin/workbox generate:sw

mv .pwa-temporary/sw.js .pwa-temporary/$UUID.js
echo $UUID > .pwa-temporary/release-uuid.txt

rm -r releases/pwas/$GROUP
mv .pwa-temporary releases/pwas/$GROUP
echo "Release with UUID of $UUID"
