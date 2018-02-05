#!/bin/bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

TAG=$(git rev-parse --abbrev-ref HEAD);
docker build -t tangerine/tangerine:$TAG .
docker kill $T_CONTAINER_NAME 
docker rm $T_CONTAINER_NAME
./start.sh $TAG 
docker logs -f $T_CONTAINER_NAME
