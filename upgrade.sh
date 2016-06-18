#!/usr/bin/env bash

set -v
source ./config.defaults.sh
if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker pull tangerine/tangerine-server:$TANGERINE_SERVER_VERSION
docker stop tangerine-server-container 
docker rm tangerine-server-container 
./install.sh

