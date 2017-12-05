#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

echo "Pulling $T_TAG"
docker pull tangerine/tangerine:$T_TAG
docker stop $T_CONTAINER_NAME > /dev/null 
docker rm $T_CONTAINER_NAME > /dev/null 
echo "Running $T_CONTAINER_NAME at version $T_TAG"
docker run -d \
  --name $T_CONTAINER_NAME \
  -p 80:80 \
  -p 5984:5984 \
  --volume $T_CONTENT_PATH:/tangerine/client/build/content \
  --volume $(pwd)/db:/tangerine/server/db/ \
  tangerine/tangerine:$T_TAG
