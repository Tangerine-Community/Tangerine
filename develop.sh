#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker pull tangerine/tangerine:$TANGERINE_VERSION
docker kill tangerine-container 
docker rm tangerine-container
docker run \
  --name tangerine-container \
  -p 80:80 \
  --env "T_RUN_MODE=development" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --volume $T_VOLUMES/couchdb/:/var/lib/couchdb \
  --volume $T_VOLUMES/apks/:/tangerine-server/tree/apks \
  --volume $(pwd)/editor/src/js:/tangerine-server/editor/src/js \
  --volume $(pwd)/client/src/js:/tangerine-server/client/src/js \
  tangerine/tangerine:$TANGERINE_VERSION
