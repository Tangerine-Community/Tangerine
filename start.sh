#!/usr/bin/env bash

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
if [ ! -d data/client/releases/prod/dat ]; then
  mkdir data/client/releases/prod/dat
fi
if [ ! -d data/client/releases/qa/dat ]; then
  mkdir data/client/releases/qa/dat
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

# Allow to specify Tangerine Version as parameter in ./start.sh, other wise use the most recent tag.
if [ "$1" = "" ]; then
  if [ "$T_TAG" = "" ]; then
    T_TAG=$(git describe --tags --abbrev=0)
  else
    T_TAG="$T_TAG"
  fi
else
  T_TAG="$1"
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
  --env \"NODE_ENV=production\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"T_COUCHDB_ENABLE=$T_COUCHDB_ENABLE\" \
  --env \"T_PROTOCOL=$T_PROTOCOL\" \
  --env \"T_ADMIN=$T_ADMIN\" \
  --env \"T_PASS=$T_PASS\" \
  --env \"T_UPLOAD_USER=$T_UPLOAD_USER\" \
  --env \"T_UPLOAD_PASSWORD=$T_UPLOAD_PASSWORD\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  --env \"T_REPLICATE=$T_REPLICATE\" \
  --env \"T_CSV_BATCH_SIZE=$T_CSV_BATCH_SIZE\" \
  --env \"T_MODULES=$T_MODULES\" \
  --env \"T_LANG_DIRECTION=$T_LANG_DIRECTION\" \
  --env \"T_SYNC_SERVER=$T_SYNC_SERVER\" \
  --env \"T_CATEGORIES=$T_CATEGORIES\" \
  --env \"T_REGISTRATION_REQUIRES_SERVER_USER=$T_REGISTRATION_REQUIRES_SERVER_USER\" \
  $T_PORT_MAPPING \
  --volume $(pwd)/data/worker-state.json:/worker-state.json \
  --volume $(pwd)/data/client/releases:/tangerine/client/releases/ \
  --volume $(pwd)/data/csv:/csv/ \
  --volume $(pwd)/data/db:/tangerine/db/ \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups \
" 

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
     -v $(pwd)/data/couchdb/data:/opt/couchdb/data \
     -v $(pwd)/data/couchdb/local.d:/opt/couchdb/etc/local.d \
     --name $T_COUCHDB_CONTAINER_NAME \
     -p 5984:5984 \
     couchdb
  RUN_OPTIONS="
    --link $T_COUCHDB_CONTAINER_NAME:couchdb \
    -e T_COUCHDB_ENABLE=$T_COUCHDB_ENABLE \
    -e T_COUCHDB_ENDPOINT=$T_COUCHDB_ENDPOINT \
    -e T_COUCHDB_USER_ADMIN_NAME=$T_COUCHDB_USER_ADMIN_NAME \
    -e T_COUCHDB_USER_ADMIN_PASS=$T_COUCHDB_USER_ADMIN_PASS \
    $RUN_OPTIONS
  "
  sleep 10
fi


CMD="docker run -d $RUN_OPTIONS tangerine/tangerine:$T_TAG"

echo "Running $T_CONTAINER_NAME at version $T_TAG"
echo "$CMD"
eval ${CMD}

echo "Installing missing plugin..."
docker exec tangerine bash -c "cd /tangerine/client/builds/apk/ && cordova --no-telemetry plugin add cordova-plugin-whitelist --save"
echo "Done."
