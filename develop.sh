#!/usr/bin/env bash

# Load config.
source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

T_TAG="tangerine-development"
docker build -t tangerine/tangerine:$T_TAG .

echo "Stopping $T_CONTAINER_NAME"
docker stop $T_CONTAINER_NAME > /dev/null 
echo "Removing $T_CONTAINER_NAME"
docker rm $T_CONTAINER_NAME > /dev/null 

RUN_OPTIONS="
  --name $T_CONTAINER_NAME \
  --env \"NODE_ENV=development\" \
  --env \"T_RUN_MODE=development\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"T_PROTOCOL=$T_PROTOCOL\" \
  --env \"T_ADMIN=$T_ADMIN\" \
  --env \"T_PASS=$T_PASS\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  $T_PORT_MAPPING \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/apks/:/tangerine-server/tree/apks/ \
  --volume $(pwd)/data/logs/pm2/:/tangerine-server/logs \
  --volume $(pwd)/data/logs/couchdb/couchdb.log:/var/log/couchdb/couchdb.log \
  --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/ \
  --volume $(pwd)/client-v3/tangy-forms/src/:/tangerine-server/client-v3/tangy-forms/src/ \
  --volume $(pwd)/client-v3/tangy-forms/index.html:/tangerine-server/client-v3/tangy-forms/index.html \
  --volume $(pwd)/client-v3/tangy-forms/editor.html:/tangerine-server/client-v3/tangy-forms/editor.html \
  --volume $(pwd)/client-v3/tangy-forms/editor/:/tangerine-server/client-v3/tangy-forms/editor/ \
  --volume $(pwd)/client-v3/shell/src/:/tangerine-server/client-v3/shell/src/ \
  --volume $(pwd)/data/client-v3/apks:/tangerine-server/client-v3/releases/apks/ \
  --volume $(pwd)/data/client-v3/pwas:/tangerine-server/client-v3/releases/pwas/ \
  --volume $(pwd)/data/client-v3/content/groups:/tangerine-server/client-v3/content/groups \
  --volume $(pwd)/server/index.js:/tangerine-server/server/index.js \
  --volume $(pwd)/server-v3/app/src:/tangerine-server/server-v3/app/src \
  --volume $(pwd)/server-v3/index.js:/tangerine-server/server-v3/index.js \
  --volume $T_V3_DEV_CONTENT:/tangerine-server/client-v3/builds/dev/content
" 

CMD="docker run -d $RUN_OPTIONS tangerine/tangerine:$T_TAG"

echo "Running $T_CONTAINER_NAME at version $T_TAG"
eval ${CMD}
docker logs -f $T_CONTAINER_NAME
