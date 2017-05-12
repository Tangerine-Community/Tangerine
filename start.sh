#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

# Allow to specify Tangerine Version as parameter in ./star.sh, other wise use the most recent tag.
if [ "$1" = "" ]; then
  TAG=$(git describe --tags --abbrev=0)
else
  TAG=$1
fi
echo "Pulling $TAG"
docker pull tangerine/tangerine:$TAG
NO_SUCH_CONTAINER=$(docker inspect $T_CONTAINER_NAME | grep "No such object")
echo $NO_SUCH_CONTAINER
if [ "$NO_SUCH_CONTAINER" = "" ]; then
  echo "Stopping $T_CONTAINER_NAME"
  docker stop $T_CONTAINER_NAME > /dev/null 
  echo "Removing $T_CONTAINER_NAME"
  docker rm $T_CONTAINER_NAME > /dev/null 
fi
echo "Running $T_CONTAINER_NAME at version $TAG"
docker run -d \
  --name $T_CONTAINER_NAME \
  --env "NODE_ENV=production" \
  --env "T_VERSION=$TANGERINE_VERSION" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  -p 80:80 \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/logs/pm2/:/tangerine-server/logs \
  --volume $(pwd)/data/logs/couchdb/couchdb.log:/var/log/couchdb/couchdb.log \
  --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/ \
  tangerine/tangerine:$TAG
