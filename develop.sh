#!/usr/bin/env bash

if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker pull tangerine/tangerine:$TANGERINE_VERSION
docker kill tangerine-container 
docker rm tangerine-container
docker run \
  -it \
  --name tangerine-container \
  -p 80:80 \
  --env "T_RUN_MODE=development" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/apks/:/tangerine-server/tree/apks \
  --volume $(pwd)/editor/src:/tangerine-server/editor/src \
  --volume $(pwd)/editor/app:/tangerine-server/editor/app \
  --volume $(pwd)/editor/Gulpfile.js:/tangerine-server/editor/Gulpfile.js \
  --volume $(pwd)/entrypoint.sh:/tangerine-server/entrypoint.sh \
  --volume $(pwd)/client/src:/tangerine-server/client/src \
  --volume $(pwd)/client/Gulpfile.js:/tangerine-server/client/Gulpfile.js \
  tangerine/tangerine:$TANGERINE_VERSION
