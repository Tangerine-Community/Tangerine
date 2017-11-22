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

# @TODO Pipe error output to null
echo "Stopping $T_CONTAINER_NAME"
docker stop $T_CONTAINER_NAME > /dev/null 
echo "Removing $T_CONTAINER_NAME"
docker rm $T_CONTAINER_NAME > /dev/null 

RUN_OPTIONS="
  --name $T_CONTAINER_NAME \
  --env \"NODE_ENV=production\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"DEBUG=$DEBUG\" \
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
" 
if [ "$DEBUG" = 1 ]
then
  RUN_OPTIONS="
    $RUN_OPTIONS
    --volume $(pwd)/editor/src:/tangerine-server/editor/src \
    --volume $(pwd)/editor/app:/tangerine-server/editor/app \
    --volume $(pwd)/editor/Gulpfile.js:/tangerine-server/editor/Gulpfile.js \
    --volume $(pwd)/entrypoint.sh:/tangerine-server/entrypoint.sh \
    --volume $(pwd)/client/src:/tangerine-server/client/src \
    --volume $(pwd)/upgrades:/tangerine-server/upgrades \
    --volume $(pwd)/client/Gulpfile.js:/tangerine-server/client/Gulpfile.js \
    --volume $(pwd)/cli/lib:/tangerine-server/cli/lib \
  "
fi
CMD="docker run -d $RUN_OPTIONS tangerine/tangerine:$T_TAG"

echo "Running $T_CONTAINER_NAME at version $T_TAG"
eval ${CMD}
