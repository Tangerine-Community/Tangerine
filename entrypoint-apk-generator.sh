#!/bin/sh

cd /tangerine/apk-generator/

echo "DEBUG = $DEBUG";

if [ "$DEBUG" ];
then
  echo "Starting server-ui in dev mode"
  npm start:dev
else
  echo "Starting server-ui in production mode."
  npm start
fi