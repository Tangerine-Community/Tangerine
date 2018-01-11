#!/usr/bin/env bash

# Load config.
source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

# Allow to specify Tangerine Version as parameter in ./start.sh, other wise use the most recent tag.
if [ "$T_TAG" = "" ]; then
  T_TAG=$(git describe --tags --abbrev=0)
fi

# Pull tag.
echo "Pulling $T_TAG"
docker pull tangerine/tangerine:$T_TAG

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
  --volume $(pwd)/client-v3/shell/src/:/tangerine-server/client-v3/shell/src/ \
  --volume $T_V3_CONTENT_PATH:/tangerine-server/client-v3/content/ \
" 

CMD="docker run -d $RUN_OPTIONS tangerine/tangerine:$T_TAG"

echo "Running $T_CONTAINER_NAME at version $T_TAG"
eval ${CMD}
