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
  --link couchdb:couchdb \
  --volume $(pwd)/connector.ini:/data/connector.ini:delegated \
  --volume $(pwd)/TangerineConnector.py:/TangerineConnector.py:delegated \
  --entrypoint=\"\"
"
CMD="docker run -it $RUN_OPTIONS tangerine/python-tangerine-synapse-connector:local bash"

echo "$CMD"
eval ${CMD}
