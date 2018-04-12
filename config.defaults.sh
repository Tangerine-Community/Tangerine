# required in config.sh
T_HOST_NAME='localhost'
T_PROTOCOL="http"
T_USER1="user1"
T_USER1_PASSWORD="password"
T_ADMIN="admin"
T_PASS="password"
T_UPLOAD_USER="uploader"
T_UPLOAD_PASSWORD="password"
T_COUCHDB_ENABLE="true"
T_COUCHDB_CONTAINER_NAME="couchdb"

# optional
T_TAG=""
T_CONTAINER_NAME="tangerine"
T_PORT_MAPPING="-p 80:80 -p 5984:5984"
T_DEV_CONTENT="$(pwd)/client/content/default"
# Add replication entries in this array to start on server boot in 
# format of `{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}`
T_REPLICATE="[]"
