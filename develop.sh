#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
fi

echo ""
echo "Building tangerine/tangerine:local from local files..."
echo ""
docker build -t tangerine/tangerine:local ./

echo ""
echo "Stopping the container if it exists..."
echo ""
docker kill tangerine-container

echo ""
echo "Removing the container if it exists..."
echo ""
docker rm tangerine-container

echo ""
echo "Running the container..."
echo ""
docker run \
  -d \
  --name tangerine-container \
  -p 80:80 \
  -p 3282 \
  -p 3282/udp \
  --env "DEBUG=1" \
  --env "NODE_ENV=development" \
  --env "T_VERSION=local" \
  --env "T_RUN_MODE=development" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/apks/:/tangerine-server/tree/apks \
  --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/ \
  --volume $(pwd)/data/logs/couchdb/couchdb.log:/var/log/couchdb/couchdb.log \
  --volume $(pwd)/editor/src:/tangerine-server/editor/src \
  --volume $(pwd)/editor/app:/tangerine-server/editor/app \
  --volume $(pwd)/editor/Gulpfile.js:/tangerine-server/editor/Gulpfile.js \
  --volume $(pwd)/entrypoint.sh:/tangerine-server/entrypoint.sh \
  --volume $(pwd)/upgrades:/tangerine-server/upgrades \
  --volume $(pwd)/cli/lib:/tangerine-server/cli/lib \
  --volume $(pwd)/raisin:/tangerine-server/raisin \
  --volume $(pwd)/projects:/tangerine-server/projects \
  --volume $(pwd)/tangy:/tangerine-server/tangy \
  tangerine/tangerine:local
docker logs -f tangerine-container
