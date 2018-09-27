#!/usr/bin/env bash

set -e

if [ ! -d data ]; then
  mkdir data
fi
if [ ! -d data/csv ]; then
  mkdir data/csv
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
if [ ! -d data/client/releases/prod/dat ]; then
  mkdir data/client/releases/prod/dat
fi
if [ ! -d data/client/releases/qa/dat ]; then
  mkdir data/client/releases/qa/dat
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
if [ ! -f data/worker-state.json ]; then
  echo '{}' > data/worker-state.json
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
  --env \"T_UPLOAD_TOKEN=$T_UPLOAD_TOKEN\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  --env \"T_REPLICATE=$T_REPLICATE\" \
  --env \"T_CSV_BATCH_SIZE=$T_CSV_BATCH_SIZE\" \
  --env \"T_HIDE_PROFILE=$T_HIDE_PROFILE\" \
  --env \"T_MODULES=$T_MODULES\" \
  --env \"T_LANG_DIRECTION=$T_LANG_DIRECTION\" \
  --env \"T_LEGACY=$T_LEGACY\" \
  --env \"T_SYNC_SERVER=$T_SYNC_SERVER\" \
  --env \"T_REGISTRATION_REQUIRES_SERVER_USER=$T_REGISTRATION_REQUIRES_SERVER_USER\" \
  --env \"T_CATEGORIES=$T_CATEGORIES\" \
  $T_PORT_MAPPING \
  -p 9229:9229 \
  -p 9228:9228 \
  -p 9227:9227 \
  -p 9226:9226 \
  -p 9225:9225 \
  --volume $(pwd)/data/db:/tangerine/db/ \
  --volume $(pwd)/data/csv:/csv/ \
  --volume $(pwd)/data/worker-state.json:/worker-state.json \
  --volume $(pwd)/data/client/releases:/tangerine/client/releases/ \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups \
  --volume $(pwd)/data/client/content/assets:/tangerine/client/content/assets \
  --volume $(pwd)/server/index.js:/tangerine/server/index.js \
  --volume $(pwd)/server/src:/tangerine/server/src \
  --volume $(pwd)/server/reporting:/tangerine/server/reporting \
  --volume $(pwd)/server/upgrades:/tangerine/server/upgrades \
  --volume $(pwd)/upgrades:/tangerine/upgrades \
  --volume $(pwd)/scripts/generate-csv/bin.js:/tangerine/scripts/generate-csv/bin.js \
  --volume $(pwd)/scripts/generate-csv/batch.js:/tangerine/scripts/generate-csv/batch.js \
  --volume $(pwd)/editor/src:/tangerine/editor/src \
  --volume $(pwd)/client/release-dat.sh:/tangerine/client/release-dat.sh \
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
