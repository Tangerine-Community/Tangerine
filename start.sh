#!/usr/bin/env bash

# Load config.
source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

# Allow to specify Tangerine Version as parameter in ./start.sh, other wise use the most recent tag.
if [ "$1" = "" ] && [ "$T_TAG" = "" ]; then
  TAG=$(git describe --tags --abbrev=0)
fi
echo $T_TAG
if  [ "$T_TAG" != "" ]; then
  TAG=$T_TAG
fi
if  [ "$1" != "" ]; then
  TAG=$1
fi

# Pull tag.
echo "Pulling $TAG"
docker pull tangerine/tangerine:$TAG

# Check if the container exists, if so, stop and remove it.
NO_SUCH_CONTAINER=$(docker inspect $T_CONTAINER_NAME | grep "No such object")
echo $NO_SUCH_CONTAINER
if [ "$NO_SUCH_CONTAINER" = "" ]; then
  echo "Stopping $T_CONTAINER_NAME"
  docker stop $T_CONTAINER_NAME > /dev/null 
  echo "Removing $T_CONTAINER_NAME"
  docker rm $T_CONTAINER_NAME > /dev/null 
fi

echo "Running $T_CONTAINER_NAME at version $TAG"

echo "docker run -d --name $T_CONTAINER_NAME   --env \"NODE_ENV=production\"   --env \"T_VERSION=$TANGERINE_VERSION\"   --env \"T_PROTOCOL=$T_PROTOCOL\"   --env \"T_ADMIN=$T_ADMIN\"   --env \"T_PASS=$T_PASS\"   --env \"T_USER1=$T_USER1\"   --env \"T_USER1_PASSWORD=$T_USER1_PASSWORD\"   --env \"T_HOST_NAME=$T_HOST_NAME\"   $T_PORT_MAPPING   --volume $(pwd)/data/couchdb/:/var/lib/couchdb   --volume $(pwd)/data/logs/pm2/:/tangerine-server/logs   --volume $(pwd)/data/logs/couchdb/couchdb.log:/var/log/couchdb/couchdb.log   --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/    tangerine/tangerine:$TAG" | sh
