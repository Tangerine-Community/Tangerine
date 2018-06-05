#!/usr/bin/env bash

set -e

if [ ! -d data ]; then
  mkdir data
fi
if [ ! -d data/client ]; then
  mkdir data/client
fi
if [ ! -d data/client/releases ]; then
  mkdir data/client/releases
fi
if [ ! -d data/client/releases/prod ]; then
  mkdir data/client/releases/prod
fi
if [ ! -d data/client/releases/prod/apks ]; then
  mkdir data/client/releases/prod/apks
fi
if [ ! -d data/client/releases/prod/pwas ]; then
  mkdir data/client/releases/prod/pwas
fi
if [ ! -d data/client/releases/qa ]; then
  mkdir data/client/releases/qa
fi
if [ ! -d data/client/releases/qa/apks ]; then
  mkdir data/client/releases/qa/apks
fi
if [ ! -d data/client/releases/qa/pwas ]; then
  mkdir data/client/releases/qa/pwas
fi

# Load config.

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

docker build -t tangerine/tangerine:local .
[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker stop $T_CONTAINER_NAME
[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

COUCHDB_OPTIONS=""
if [ "$T_COUCHDB_ENABLE" = "true" ] && [ "$T_COUCHDB_LOCAL" = "true" ]; then
  if [ ! -d data/couchdb ]; then
    mkdir data/couchdb
  fi
  if [ ! -d data/couchdb/data ]; then
    mkdir data/couchdb/data
  fi
  if [ ! -d data/couchdb/local.d ]; then
    mkdir data/couchdb/local.d
  fi
  if [ ! -f data/couchdb/local.d/local.ini ]; then
    echo "
[chttpd]
bind_address = any

[httpd]
bind_address = any

[couch_httpd_auth]
require_valid_user = true

[chttpd]
require_valid_user = true
    " > data/couchdb/local.d/local.ini
  fi
  [ "$(docker ps | grep $T_COUCHDB_CONTAINER_NAME)" ] && docker stop $T_COUCHDB_CONTAINER_NAME
  [ "$(docker ps -a | grep $T_COUCHDB_CONTAINER_NAME)" ] && docker rm $T_COUCHDB_CONTAINER_NAME
  docker run -d \
     -e COUCHDB_USER=$T_COUCHDB_USER_ADMIN_NAME \
     -e COUCHDB_PASSWORD=$T_COUCHDB_USER_ADMIN_PASS \
     -p 5984:5984 \
     -v $(pwd)/data/couchdb/data:/opt/couchdb/data \
     -v $(pwd)/data/couchdb/local.d:/opt/couchdb/etc/local.d \
     --name $T_COUCHDB_CONTAINER_NAME \
     couchdb
  COUCHDB_OPTIONS="
    --link $T_COUCHDB_CONTAINER_NAME:couchdb \
    -e T_COUCHDB_ENABLE=$T_COUCHDB_ENABLE \
    -e T_COUCHDB_ENDPOINT=\"$T_COUCHDB_ENDPOINT\" \
    -e T_COUCHDB_USER_ADMIN_NAME=$T_COUCHDB_USER_ADMIN_NAME \
    -e T_COUCHDB_USER_ADMIN_PASS=$T_COUCHDB_USER_ADMIN_PASS \
  "
fi

sleep 10

CMD="docker run -it --name $T_CONTAINER_NAME \
  $COUCHDB_OPTIONS \
  --entrypoint=\"/tangerine/entrypoint-development.sh\" \
  --env \"NODE_ENV=development\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"T_PROTOCOL=$T_PROTOCOL\" \
  --env \"T_ADMIN=$T_ADMIN\" \
  --env \"T_PASS=$T_PASS\" \
  --env \"T_UPLOAD_USER=$T_UPLOAD_USER\" \
  --env \"T_UPLOAD_PASSWORD=$T_UPLOAD_PASSWORD\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  --env \"T_REPLICATE=$T_REPLICATE\" \
  $T_PORT_MAPPING \
  --volume $(pwd)/data/db:/tangerine/db/ \
  --volume $(pwd)/data/feeds.json:/tangerine/feeds.json \
  --volume $(pwd)/data/client/releases:/tangerine/client/releases/ \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups \
  --volume $(pwd)/data/client/content/assets:/tangerine/client/content/assets \
  --volume $(pwd)/server/index.js:/tangerine/server/index.js \
  --volume $(pwd)/server/reporting:/tangerine/server/reporting \
  --volume $(pwd)/server/upgrades:/tangerine/server/upgrades \
  --volume $(pwd)/upgrades:/tangerine/upgrades \
  --volume $(pwd)/editor/src:/tangerine/editor/src \
  --volume $(pwd)/client/shell/src:/tangerine/client/shell/src \
  --volume $(pwd)/client/shell/package.json:/tangerine/client/shell/package.json \
  --volume $(pwd)/client/ckeditor:/tangerine/client/ckeditor \
  --volume $(pwd)/client/tangy-forms/src:/tangerine/client/tangy-forms/src \
  --volume $(pwd)/client/tangy-forms/assets:/tangerine/client/tangy-forms/assets \
  --volume $(pwd)/client/tangy-forms/index.html:/tangerine/client/tangy-forms/index.html \
  --volume $(pwd)/client/tangy-forms/editor.html:/tangerine/client/tangy-forms/editor.html \
  --volume $(pwd)/client/tangy-forms/package.json:/tangerine/client/tangy-forms/package.json \
  --volume $(pwd)/client/tangy-forms/yarn.lock:/tangerine/client/tangy-forms/yarn.lock \
  --volume $T_DEV_CONTENT:/tangerine/client/builds/dev/content \
  --volume $T_DEV_CONTENT:/tangerine/client/content/default \
 tangerine/tangerine:local
 "

 eval ${CMD}
