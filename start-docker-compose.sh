#!/bin/sh
set -e
echo "Running start-docker-compose.sh"
echo "pwd: $pwd"


#
# Set up data folders.
#

#if [ ! -d /tangerine ]; then
#  mkdir /tangerine
#  IS_INSTALLING="true"
#fi

#cd /tangerine

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
if [ ! -d state ]; then
  mkdir state
fi

docker compose up -d
