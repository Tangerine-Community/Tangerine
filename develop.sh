#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

docker build -t tangerine/tangerine:dev .
docker kill tangerine-dev  
docker rm tangerine-dev 
docker run \
  --env DEBUG=true \
  --name tangerine-dev \
  -p 80:80 \
  -p 5984:5984 \
  --volume $(pwd)/client/content:/tangerine/client/build/content \
  --volume $(pwd)/db:/tangerine/server/db/ \
  --volume $(pwd)/client/tangy-forms/index.html:/tangerine/client/tangy-forms/index.html \
  --volume $(pwd)/client/tangy-forms/src:/tangerine/client/tangy-forms/src \
  --volume $(pwd)/client/app-updater/index.html:/tangerine/client/app-updater/index.html \
  --volume $(pwd)/client/app-updater/src:/tangerine/client/app-updater/src \
  --volume $(pwd)/client/shell/src:/tangerine/client/shell/src \
  --volume $(pwd)/server/index.js:/tangerine/server/index.js \
  tangerine/tangerine:dev

# docker logs -f tangerine-container
#  -it \
#  --entrypoint=/tangerine/entrypoint-develop.sh \
