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
  echo "  ./release-apk.sh a4uw93 ./content/group-a"
  echo ""
  echo "Then visit https://foo.tangerinecentral.org/releases/apk/a4uw93.apk"
fi

cp -r /tangerine/client/builds/apk /.tmp-apk
rm -r /.tmp-apk/www/content
cp -r $CONTENT_PATH /.tmp-apk/www/content
cd /.tmp-apk 
rm /tangerine/client/releases/apks/$SECRET.zip
zip -rq /tangerine/client/releases/apks/$SECRET.zip ./* 
rm -r /.tmp-apk
