set -v
docker build -t tangerine/tangerine-server:local ../
docker kill tangerine-server-container
docker rm tangerine-server-container
source ./config.sh
echo $T_ADMIN
docker run -d \
  --name tangerine-server-container \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_ADMIN=$T_ADMIN" \
  --env "T_PASS=$T_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_TREE_HOSTNAME=$T_TREE_HOSTNAME" \
  --env "T_TREE_URL=$T_TREE_URL" \
  --env "T_HOST_NAME=$T_HOST_NAME" \
  -p 80:80 \
  -p 5984:5984 \
  --volume $T_VOLUMES/tangerine-server/couchdb/:/var/lib/couchdb \
  tangerine/tangerine-server:local
docker logs -f tangerine-server-container
