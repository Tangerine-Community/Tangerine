#!/bin/bash

SECRET="$1"
CONTENT_PATH="$2"

if [ "$SECRET" = "" ] || [ "$CONTENT_PATH" = "" ]; then
  echo ""
  echo "RELEASE APK"
  echo "A command for releasing an APK using a secret URL."
  echo ""
  echo "./release-apk.sh <secret> <content path>"
  echo ""
  echo "Usage:"
  echo "  ./release-apk.sh a4uw93 /tangerine-server/data/content/group-a"
  echo ""
  echo "Then visit https://foo.tanerinecentral.org/apk/a4uw93.apk"
fi

cp -r /tangerine-server/client /.tmp-client
rm -r /.tmp-client/node_modules
rm -r /.tmp-client/www
cp -r /tangerine-server/client-v3/builds/apk /.tmp-client/www
cp -r $CONTENT_PATH /.tmp-client/www/content
cd /.tmp-client 
rm /tangerine-server/client-v3/releases/apks/$SECRET.zip
zip -rq /tangerine-server/client-v3/releases/apks/$SECRET.zip ./* 
rm -r /.tmp-client
