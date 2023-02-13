#!/bin/sh

cd /tangerine/server/

echo "DEBUG = $DEBUG";

if [ "$DEBUG" ];
then
  echo "Starting server in dev mode"
  npm start:dev
else
  echo "Starting server in production mode."
  npm start
fi