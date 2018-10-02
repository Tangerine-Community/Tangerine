# required in config.sh
T_HOST_NAME='localhost'
T_PROTOCOL="http"
T_USER1="user1"
T_USER1_PASSWORD="password"
T_ADMIN="admin"
T_PASS="password"
T_UPLOAD_TOKEN="change_this_token"
T_COUCHDB_ENABLE="true"
T_COUCHDB_LOCAL="true"
T_COUCHDB_USER_ADMIN_NAME="admin"
T_COUCHDB_USER_ADMIN_PASS="password"
# Note that the / at the end is required.
T_COUCHDB_ENDPOINT="http://admin:password@couchdb:5984/"

# optional
T_TAG=""
T_CONTAINER_NAME="tangerine"
T_COUCHDB_CONTAINER_NAME="couchdb"
T_PORT_MAPPING="-p 80:80"
T_CSV_BATCH_SIZE=50
T_HIDE_PROFILE="false"
T_DEV_CONTENT="$(pwd)/client/content/default"
T_REGISTRATION_REQUIRES_SERVER_USER="false"
# Add replication entries in this array to start on server boot in 
# format of `{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}`
T_REPLICATE="[]"
# To enable the Class dashboard, set to "['class']"
T_MODULES="[]"
# To populate categories in Class:
#T_CATEGORIES="['one','two','three','four']"
T_LANG_DIRECTION="ltr"
T_SYNC_SERVER="localhost:5984"
T_LEGACY="false"

