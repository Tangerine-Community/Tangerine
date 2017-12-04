#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

echo "Pulling $T_TAG"
docker pull tangerine/tangerine:$T_TAG

NO_SUCH_CONTAINER=$(docker inspect $T_CONTAINER_NAME | grep "No such object")
echo $NO_SUCH_CONTAINER
if [ "$NO_SUCH_CONTAINER" = "" ]; then
  echo "Stopping $T_CONTAINER_NAME"
  docker stop $T_CONTAINER_NAME > /dev/null 
  echo "Removing $T_CONTAINER_NAME"
  docker rm $T_CONTAINER_NAME > /dev/null 
fi

echo "Running $T_CONTAINER_NAME at version $T_TAG"
docker run -d \
  --name $T_CONTAINER_NAME \
  -p 80:80 \
  --volume $T_CONTENT_PATH:/tangerine/client/build/content \
  tangerine/tangerine:$T_TAG
