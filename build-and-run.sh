#!/bin/bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

IMAGE_NAME=$(git rev-parse --abbrev-ref HEAD);
echo IMAGE_NAME is $IMAGE_NAME
docker build -t tangerine/tangerine:$IMAGE_NAME .
#docker kill $T_CONTAINER_NAME
#docker rm $T_CONTAINER_NAME
./start.sh $IMAGE_NAME 
docker logs -f $T_CONTAINER_NAME
