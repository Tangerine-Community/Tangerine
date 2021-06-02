#!/usr/bin/env bash

#
# Start container.
#

docker build -t tangerine/python-tangerine-synapse-connector:local .

T_CONTAINER_NAME="python-tangerine-synapse-connector"

[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker stop $T_CONTAINER_NAME
[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

RUN_OPTIONS="
  --name $T_CONTAINER_NAME \
  --volume $(pwd)/connector.ini:/connector.ini:delegated \
  --volume $(pwd)/clear-cache.py:/clear-cache.py \
  --entrypoint=\"\"
"
# --entrypoint=\"/usr/local/bin/python /clear-cache.py\"
CMD="docker run -it $RUN_OPTIONS tangerine/python-tangerine-synapse-connector:local python /clear-cache.py"

echo "$CMD"
eval ${CMD}

docker logs -f python-tangerine-synapse-connector
