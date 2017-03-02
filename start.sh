#!/usr/bin/env bash

set -v
if [ -f "./config.sh" ]
then
  source ./config.sh
fi

docker stop nginx-proxy
docker rm nginx-proxy
docker run -d -p 80:80 -p 443:443 \
  --name nginx-proxy \
  -v $(pwd)/data/certs:/etc/nginx/certs:ro \
  -v /etc/nginx/vhost.d \
  -v /usr/share/nginx/html \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  jwilder/nginx-proxy

docker stop letsencrypt-nginx-proxy-companion
docker rm letsencrypt-nginx-proxy-companion
docker run -d \
  --name letsencrypt-nginx-proxy-companion \ 
  -v $(pwd)/data/certs:/etc/nginx/certs:rw \
  --volumes-from nginx-proxy \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  jrcs/letsencrypt-nginx-proxy-companion

docker pull tangerine/tangerine:$TANGERINE_VERSION
docker stop tangerine-container 
docker rm tangerine-container 
docker run -d \
  --name tangerine-container \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  --env "VIRTUAL_HOST=$T_HOST_NAME" \
  --expose 80 \
  --volume $(pwd)/data/couchdb/:/var/lib/couchdb \
  --volume $(pwd)/data/log/couchdb/:/var/log/couchdb \
  --volume $(pwd)/data/log/nginx/:/var/log/nginx \
  --volume $(pwd)/data/media_assets/:/tangerine-server/client/media_assets/ \
  tangerine/tangerine:$TANGERINE_VERSION
