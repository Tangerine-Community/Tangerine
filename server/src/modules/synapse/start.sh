#!/usr/bin/env bash

#
# Start container.
#

T_CONTAINER_NAME="python-tangerine-synapse-connector"

[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker stop $T_CONTAINER_NAME
[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

RUN_OPTIONS="
  --name $T_CONTAINER_NAME \
  --volume $(pwd)/connector.ini:/data/connector.ini:delegated \
  --volume $(pwd)/TangerineConnector.py:/TangerineConnector.py:delegated
"
CMD="docker run -d $RUN_OPTIONS tangerine/python-tangerine-synapse-connector"

echo "$CMD"
eval ${CMD}

docker logs -f python-tangerine-synapse-connector
