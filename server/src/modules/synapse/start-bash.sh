#!/usr/bin/env bash

#
# Start container.
#

T_CONTAINER_NAME="python-tangerine-synapse-connector"

docker build -t tangerine/${T_CONTAINER_NAME}:local .

[ "$(docker ps | grep $T_CONTAINER_NAME)" ] && docker stop $T_CONTAINER_NAME
[ "$(docker ps -a | grep $T_CONTAINER_NAME)" ] && docker rm $T_CONTAINER_NAME

RUN_OPTIONS="
  --name $T_CONTAINER_NAME \
  --link couchdb:couchdb \
  --volume $(pwd)/connector.ini:/data/connector.ini:delegated \
  --volume $(pwd)/SynapseConnector.py:/SynapseConnector.py:delegated \
  --entrypoint=\"\"
"
CMD="docker run -it $RUN_OPTIONS tangerine/${T_CONTAINER_NAME}:local bash"

echo "$CMD"
eval ${CMD}
