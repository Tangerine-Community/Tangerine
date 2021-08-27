#!/usr/bin/env bash

set -e

#
# Set up data folders.
#

if [ ! -d data ]; then
  mkdir data
fi
if [ ! -d data/csv ]; then
  mkdir data/csv
fi
if [ ! -d data/client ]; then
  mkdir data/client
fi
if [ ! -d data/archives ]; then
  mkdir data/archives
fi
if [ ! -d data/client/releases ]; then
  mkdir data/client/releases
fi
if [ ! -d data/client/releases/prod ]; then
  mkdir data/client/releases/prod
fi
if [ ! -d data/client/releases/qa ]; then
  mkdir data/client/releases/qa
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


#
# Load config.
#

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

T_COUCHDB_ENDPOINT="http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASS@couchdb:5984/"

docker build -t tangerine/tangerine:local .
[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker stop $T_CONTAINER_NAME
[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

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
   couchdb:2

sleep 10

#
# Start Tangerine.
#

CMD="docker run -it --name $T_CONTAINER_NAME \
  --link $T_COUCHDB_CONTAINER_NAME:couchdb \
  -e T_COUCHDB_ENDPOINT=\"$T_COUCHDB_ENDPOINT\" \
  -e T_COUCHDB_USER_ADMIN_NAME=$T_COUCHDB_USER_ADMIN_NAME \
  -e T_COUCHDB_USER_ADMIN_PASS=$T_COUCHDB_USER_ADMIN_PASS \
  --entrypoint=\"/tangerine/entrypoint-development.sh\" \
  --env \"NODE_ENV=development\" \
  --env \"T_VERSION=$T_TAG\" \
  --env \"T_PROTOCOL=$T_PROTOCOL\" \
  --env \"T_UPLOAD_TOKEN=$T_UPLOAD_TOKEN\" \
  --env \"T_USER1=$T_USER1\" \
  --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\" \
  --env \"T_HOST_NAME=$T_HOST_NAME\" \
  --env \"T_USER1_MANAGED_SERVER_USERS=$T_USER1_MANAGED_SERVER_USERS\" \
  --env \"T_PAID_ALLOWANCE=$T_PAID_ALLOWANCE\" \
  --env \"T_PAID_MODE=$T_PAID_MODE\" \
  --env \"T_REPORTING_DELAY=$T_REPORTING_DELAY\" \
  --env \"T_CSV_BATCH_SIZE=$T_CSV_BATCH_SIZE\" \
  --env \"T_HIDE_PROFILE=$T_HIDE_PROFILE\" \
  --env \"T_MODULES=$T_MODULES\" \
  --env \"T_LEGACY=$T_LEGACY\" \
  --env \"T_REGISTRATION_REQUIRES_SERVER_USER=$T_REGISTRATION_REQUIRES_SERVER_USER\" \
  --env \"T_CENTRALLY_MANAGED_USER_PROFILE=$T_CENTRALLY_MANAGED_USER_PROFILE\" \
  --env \"T_CATEGORIES=$T_CATEGORIES\" \
  --env \"T_ORIENTATION=$T_ORIENTATION\" \
  --env \"T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH=$T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH\" \
  --env \"T_REPORTING_MARK_SKIPPED_WITH=$T_REPORTING_MARK_SKIPPED_WITH\" \
  --env \"T_REPORTING_MARK_UNDEFINED_WITH=$T_REPORTING_MARK_UNDEFINED_WITH\" \
  --env \"T_HIDE_SKIP_IF=$T_HIDE_SKIP_IF\" \
  --env \"T_NGROK_AUTH_TOKEN=$T_NGROK_AUTH_TOKEN\" \
  --env \"T_NGROK_SUBDOMAIN=$T_NGROK_SUBDOMAIN\" \
  --env \"T_ARCHIVE_APKS_TO_DISK=$T_ARCHIVE_APKS_TO_DISK\" \
  --env \"T_ARCHIVE_PWAS_TO_DISK=$T_ARCHIVE_PWAS_TO_DISK\" \
  --env \"T_PASSWORD_POLICY=$T_PASSWORD_POLICY\" \
  --env \"T_PASSWORD_RECIPE=$T_PASSWORD_RECIPE\" \
  $T_PORT_MAPPING \
  -p 9229:9229 \
  -p 9228:9228 \
  -p 9227:9227 \
  -p 9226:9226 \
  -p 9225:9225 \
  --volume $(pwd)/data/groups:/tangerine/groups/:delegated \
  --volume $(pwd)/data/csv:/csv/:delegated \
  --volume $(pwd)/data/archives:/archives/:delegated \
  --volume $(pwd)/data/reporting-worker-state.json:/reporting-worker-state.json:delegated \
  --volume $(pwd)/data/paid-worker-state.json:/paid-worker-state.json:delegated \
  --volume $(pwd)/data/client/releases:/tangerine/client/releases/:delegated \
  --volume $(pwd)/data/client/content/groups:/tangerine/client/content/groups:delegated \
  --volume $(pwd)/data/client/content/assets:/tangerine/client/content/assets:delegated \
  --volume $(pwd)/server/package.json:/tangerine/server/package.json:delegated \
  --volume $(pwd)/server/src:/tangerine/server/src:delegated \
  --volume $(pwd)/client/src:/tangerine/client/src:delegated \
  --volume $(pwd)/server/reporting:/tangerine/server/reporting:delegated \
  --volume $(pwd)/upgrades:/tangerine/upgrades:delegated \
  --volume $(pwd)/scripts/generate-csv/bin.js:/tangerine/scripts/generate-csv/bin.js:delegated \
  --volume $(pwd)/scripts/generate-csv/batch.js:/tangerine/scripts/generate-csv/batch.js:delegated \
  --volume $(pwd)/editor/src:/tangerine/editor/src:delegated \
  --volume $(pwd)/client/node_modules/tangy-form:/tangerine/client/node_modules/tangy-form \
  --volume $(pwd)/editor/node_modules/tangy-form:/tangerine/editor/node_modules/tangy-form \
  --volume $(pwd)/editor/node_modules/tangy-form-editor:/tangerine/editor/node_modules/tangy-form-editor \
 tangerine/tangerine:local
 "

 eval ${CMD}
