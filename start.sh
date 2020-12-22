#!/usr/bin/env bash

#
# Set up data folders.
#

if [ ! -d data ]; then
  mkdir data
  IS_INSTALLING="true"
fi
if [ ! -d data/csv ]; then
  mkdir data/csv
fi
if [ ! -d data/archives ]; then
  mkdir data/archives
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
if [ ! -f data/id_rsa ]; then
  echo '' > data/id_rsa
fi
if [ ! -f data/id_rsa.pub ]; then
  echo '' > data/id_rsa.pub
fi
if [ ! -f data/reporting-worker-state.json ]; then
  echo '{}' > data/reporting-worker-state.json
fi
if [ ! -f data/paid-worker-state.json ]; then
  echo '{}' > data/paid-worker-state.json
fi
if [ ! -d data/dat-output ]; then
  mkdir data/dat-output
fi

#
# Load config.
#

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

if echo "$T_MODULES" | grep mysql; then
  ./mysql-start.sh
  echo "Waiting 60 seconds for myql to start..."
  sleep 60
fi
if [ "$IS_INSTALLING" = "true" ]; then
  ./mysql-setup.sh
fi

#
# Get software and shut down existing containers if they exist.
#

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

echo "Pulling $T_TAG"
docker pull tangerine/tangerine:$T_TAG

echo "Stopping $T_CONTAINER_NAME"
docker stop $T_CONTAINER_NAME > /dev/null 
echo "Removing $T_CONTAINER_NAME"
docker rm $T_CONTAINER_NAME > /dev/null 

#
# Set up couchdb
#

T_COUCHDB_ENDPOINT="http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASS@couchdb:5984/"

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

CMD="docker run -d \
   -e COUCHDB_USER=\"$T_COUCHDB_USER_ADMIN_NAME\" \
   -e COUCHDB_PASSWORD=\"$T_COUCHDB_USER_ADMIN_PASS\" \
   $T_COUCHDB_PORT_MAPPING \
   -v $(pwd)/data/couchdb/data:/opt/couchdb/data \
   -v $(pwd)/data/couchdb/local.d:/opt/couchdb/etc/local.d \
   --name \"$T_COUCHDB_CONTAINER_NAME\" \
   couchdb:2
"
echo $CMD
eval "$CMD"
sleep 10

#
# Start Tangerine.
#

RUN_OPTIONS="
  --link $T_COUCHDB_CONTAINER_NAME:couchdb \
  --name $T_CONTAINER_NAME \
  --restart unless-stopped \
  --env \"NODE_ENV=development\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"T_PROTOCOL=$T_PROTOCOL\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  --env \"T_UPLOAD_TOKEN=$T_UPLOAD_TOKEN\" \
  --env \"T_COUCHDB_ENDPOINT=$T_COUCHDB_ENDPOINT\" \
  --env \"T_USER1_MANAGED_SERVER_USERS=$T_USER1_MANAGED_SERVER_USERS\" \
  --env \"T_HIDE_PROFILE=$T_HIDE_PROFILE\" \
  --env \"T_CSV_BATCH_SIZE=$T_CSV_BATCH_SIZE\" \
  --env \"T_REPORTING_DELAY=$T_REPORTING_DELAY\" \
  --env \"T_MODULES=$T_MODULES\" \
  --env \"T_PAID_ALLOWANCE=$T_PAID_ALLOWANCE\" \
  --env \"T_PAID_MODE=$T_PAID_MODE\" \
  --env \"T_CATEGORIES=$T_CATEGORIES\" \
  --env \"T_LEGACY=$T_LEGACY\" \
  --env \"T_REGISTRATION_REQUIRES_SERVER_USER=$T_REGISTRATION_REQUIRES_SERVER_USER\" \
  --env \"T_CENTRALLY_MANAGED_USER_PROFILE=$T_CENTRALLY_MANAGED_USER_PROFILE\" \
  --env \"T_ORIENTATION=$T_ORIENTATION\" \
  --env \"T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH=$T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH\" \
  --env \"T_REPORTING_MARK_SKIPPED_WITH=$T_REPORTING_MARK_SKIPPED_WITH\" \
  --env \"T_HIDE_SKIP_IF=$T_HIDE_SKIP_IF\" \
  $T_PORT_MAPPING \
  --volume $(pwd)/content-sets:/tangerine/content-sets:delegated \
  --volume $(pwd)/data/dat-output:/dat-output/ \
  --volume $(pwd)/data/reporting-worker-state.json:/reporting-worker-state.json \
  --volume $(pwd)/data/paid-worker-state.json:/paid-worker-state.json \
  --volume $(pwd)/data/id_rsa:/root/.ssh/id_rsa:delegated \
  --volume $(pwd)/data/id_rsa.pub:/root/.ssh/id_rsa.pub:delegated \
  --volume $(pwd)/data/client/releases:/tangerine/client/releases/ \
  --volume $(pwd)/data/csv:/csv/ \
  --volume $(pwd)/data/archives:/archives/ \
  --volume $(pwd)/data/groups:/tangerine/groups/ \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups \
" 

if echo "$T_MODULES" | grep mysql; then
RUN_OPTIONS="
  --link $T_MYSQL_CONTAINER_NAME:mysql \
  --env \"T_MYSQL_CONTAINER_NAME=$T_MYSQL_CONTAINER_NAME\" \
  --env \"T_MYSQL_USER=$T_MYSQL_USER\" \
  --env \"T_MYSQL_PASSWORD=$T_MYSQL_PASSWORD\" \
  --volume $(pwd)/data/mysql/state:/mysql-module-state:delegated \
  $RUN_OPTIONS
"
fi

CMD="docker run -d $RUN_OPTIONS tangerine/tangerine:$T_TAG"

echo "Running $T_CONTAINER_NAME at version $T_TAG"
echo "$CMD"
eval ${CMD}

echo "Installing missing plugin..."
docker exec ${T_CONTAINER_NAME} bash -c "cd /tangerine/client/builds/apk/ && cordova --no-telemetry plugin add cordova-plugin-whitelist --save"
echo ""
echo ""
echo ""
echo "🍊  Woohoo! Tangerine is running! 🍊"
echo ""
echo "Run 'docker exec tangerine info' to get a list of commands."
echo ""
