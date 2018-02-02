#!/usr/bin/env bash

# Load config.

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

docker build -t tangerine/tangerine:local .
docker stop $T_CONTAINER_NAME 
docker rm $T_CONTAINER_NAME


docker run -it --name $T_CONTAINER_NAME \
  --entrypoint="/tangerine/entrypoint-development.sh" \
  --env "NODE_ENV=development" \
  --env "T_VERSION=$T_TAG" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_UPLOAD_USER=$T_UPLOAD_USER" \
  --env "T_UPLOAD_PASSWORD=$T_UPLOAD_PASSWORD" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  $T_PORT_MAPPING \
  --volume $(pwd)/data/client/apks:/tangerine/client/releases/apks/ \
  --volume $(pwd)/data/db:/tangerine/db/ \
  --volume $(pwd)/data/client/pwas:/tangerine/client/releases/pwas/ \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups \
  --volume $(pwd)/data/client/content/assets:/tangerine/client/content/assets \
  --volume $(pwd)/server/index.js:/tangerine/server/index.js \
  --volume $(pwd)/editor/src:/tangerine/editor/src \
  --volume $(pwd)/client/shell/src:/tangerine/client/shell/src \
  --volume $(pwd)/client/ckeditor:/tangerine/client/ckeditor \
  --volume $(pwd)/client/tangy-forms/src:/tangerine/client/tangy-forms/src \
  --volume $(pwd)/client/tangy-forms/index.html:/tangerine/client/tangy-forms/index.html \
  --volume $T_DEV_CONTENT:/tangerine/client/builds/dev/content \
 tangerine/tangerine:local
