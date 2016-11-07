#!/usr/bin/env bash

set -v
if [ -f "./config.sh" ]
then
  source ./config.sh
fi


docker pull tangerine/tangerine:$TANGERINE_VERSION
docker stop tangerine-container 
docker rm tangerine-container 
docker run -d \
  --name tangerine-container \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  -p 80:80 \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/ \
  tangerine/tangerine:$TANGERINE_VERSION
