#!/usr/bin/env bash

set -v
source ./config.defaults.sh
if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker pull tangerine/tangerine:$TANGERINE_VERSION
docker stop tangerine-container 
docker rm tangerine-container 
./install.sh

