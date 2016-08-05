#!/bin/bash

set -v
source ./config.defaults.sh
if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker build -t tangerine/tangerine:local .
docker kill tangerine-container
docker rm tangerine-container
source ./config.sh
docker run -d \
  --name tangerine-container \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_TREE_HOSTNAME=$T_TREE_HOSTNAME" \
  --env "T_TREE_URL=$T_TREE_URL" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  -p 80:80 \
  -p 5984:5984 \
  --volume $T_VOLUMES/tangerine/couchdb/:/var/lib/couchdb \
  --volume $T_VOLUMES/tangerine/apks/:/tangerine-server/tree/apks \
  --volume $T_VOLUMES/tangerine/lesson_plan_media/:/tangerine-server/client/src/lesson_plan_media \
  tangerine/tangerine:local
docker logs -f tangerine-container
