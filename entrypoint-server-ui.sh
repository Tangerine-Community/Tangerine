#!/bin/sh

echo "Running entrypoint-server.sh command in Dockerfile."

cd /tangerine/server-ui/

echo "NPM_DEV_MODE = $NPM_DEV_MODE";

if [ "$NPM_DEV_MODE" ];
then
  echo "Starting server-ui in dev mode"
  npm run start:dev
else
  echo "Starting server-ui in production mode."
  npm start
fi
