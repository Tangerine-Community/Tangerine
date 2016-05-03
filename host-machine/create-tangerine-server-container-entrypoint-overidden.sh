set -v
source ./config.sh
docker stop tangerine-server-container
docker rm tangerine-server-container
docker run -it \
  --name tangerine-server-container \
  --env "TH_AWS_SECRET_ACCESS_KEY=$TH_AWS_SECRET_ACCESS_KEY" \
  --env "T_PROTOCOL=$T_PROTOCOL" \
  --env "T_NEW_ADMIN=$T_NEW_ADMIN" \
  --env "T_NEW_ADMIN_PASS=$T_NEW_ADMIN_PASS" \
  --env "T_USER1=$T_USER1" \
  --env "T_USER1_PASSWORD=$T_USER1_PASSWORD" \
  --env "T_TREE_HOSTNAME=$T_TREE_HOSTNAME" \
  --env "T_TREE_URL=$T_TREE_URL" \
  -p 80:80 \
  --volume $T_VOLUMES/tangerine-server/couchdb/:/var/lib/couchdb \
  --entrypoint=bash \
  tangerine/tangerine-server:latest
