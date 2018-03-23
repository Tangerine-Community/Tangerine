#!/usr/bin/env bash

set -e

# Load config.

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

docker build -t tangerine/tangerine:local .
[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker-compose stop
#[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

#docker run -it --name $T_CONTAINER_NAME \
#  --env "NODE_ENV=development" \
#  --env "T_VERSION=$T_TAG" \
#  --env "T_PROTOCOL=$T_PROTOCOL" \
#  --env "T_ADMIN=$T_ADMIN" \
#  --env "T_PASS=$T_PASS" \
#  --env "T_USER1=$T_USER1" \
#  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
#  --env "T_HOST_NAME=$T_HOST_NAME" \
#  $T_PORT_MAPPING \
#  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
#  --volume $(pwd)/data/apks/:/tangerine/tree/apks/ \
#  --volume $(pwd)/data/logs/pm2/:/tangerine/logs \
#  --volume $(pwd)/data/logs/couchdb/couchdb.log:/var/log/couchdb/couchdb.log \
#  --volume $(pwd)/data/media_assets/:/tangerine/client/media_assets/ \
#  --volume $(pwd)/server/index.js:/tangerine/server/index.js \
#  --volume $(pwd)/server/Group.js:/tangerine/server/Group.js \
#  --volume $(pwd)/server/changesFeed.js:/tangerine/server/changesFeed.js \
#  --volume $(pwd)/server/package.json:/tangerine/server/package.json \
#  --volume $(pwd)/server/reporting:/tangerine/server/reporting \
#  --volume $(pwd)/server/routes:/tangerine/server/routes \
#  --volume $(pwd)/ecosystem.json:/tangerine/ecosystem.json \
# tangerine/tangerine:local

#docker-compose up -e T_VERSION=$T_TAG -e $T_TAG=$T_TAG
#docker-compose run -e T_VERSION=$T_TAG -e T_TAG=$T_TAG -e T_USER1=$T_USER1 -e T_USER1_PASSWORD=$T_USER1_PASSWORD tangerine bash
#docker-compose run --name $T_CONTAINER_NAME -e T_VERSION=$T_TAG -e T_PROTOCOL=$T_PROTOCOL -e T_TAG=$T_TAG -e T_USER1=$T_USER1 -e T_USER1_PASSWORD=$T_USER1_PASSWORD -e "T_HOST_NAME=$T_HOST_NAME" -e "T_ADMIN=$T_ADMIN" -e "T_PASS=$T_PASS" -e "T_PASS=$T_PASS" --name $T_CONTAINER_NAME tangerine bash
docker-compose run --service-ports -e T_VERSION=$T_TAG -e T_PROTOCOL=$T_PROTOCOL -e T_TAG=$T_TAG -e T_USER1=$T_USER1 -e T_USER1_PASSWORD=$T_USER1_PASSWORD -e T_HOST_NAME=$T_HOST_NAME -e T_ADMIN=$T_ADMIN -e T_PASS=$T_PASS tangerine bash


#couchdb tangerine