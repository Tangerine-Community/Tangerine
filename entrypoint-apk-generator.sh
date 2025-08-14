#!/bin/sh

cd /tangerine/apk-generator/

echo "NPM_DEV_MODE = $NPM_DEV_MODE";

if [ "$NPM_DEV_MODE" ];
then
  echo "Starting server-ui in dev mode"
  npm start:dev
else
  echo "Starting server-ui in production mode."
  npm start
fi
