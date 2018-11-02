# You must change the passwords or else bots will hack your site!
T_HOST_NAME='localhost'
T_PROTOCOL="http"
T_USER1="user1"
T_USER1_PASSWORD="password"
T_ADMIN="admin"
T_PASS="password"
T_UPLOAD_TOKEN="password"
T_COUCHDB_USER_ADMIN_NAME="admin"
T_COUCHDB_USER_ADMIN_PASS="password"

#
# optional
#

# Don't want the default container name of tangerine? Specify that here.
T_CONTAINER_NAME="tangerine"
# @TODO Deprecated? I think it's based on the container name above.
T_COUCHDB_CONTAINER_NAME="couchdb"
# Open additional ports. You probably don't need to do this.
T_PORT_MAPPING="-p 80:80"
# Control wether or not the limit of reporting output is per group or sidewide. The other option is "group" which will make sure allowance applies to the group level.
T_PAID_MODE="site"
# The number of form responses uploaded that will be marked paid thus end up in the reporting outputs.
T_PAID_ALLOWANCE="unlimited"
# When CSV is generated, this determines how many form responses are held in memory during a batch. The higher the number the more memory this process will take but the faster it will complete. 
T_CSV_BATCH_SIZE=50
# On client, prevent users from editing their own profile.
T_HIDE_PROFILE="false"
# On device registration, after user creates account, will force user to enter 6 character code that references online account.
T_REGISTRATION_REQUIRES_SERVER_USER="false"
# On client sync, will result in any changes made to a user profile on the server to be downloaded and reflected on the client.
T_CENTRALLY_MANAGED_USER_PROFILE="false"
# Add replication entries in this array to start on server boot in 
# format of `{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}`
T_REPLICATE="[]"
# To enable the Class dashboard, set to "['class']"
T_MODULES="[]"
# To populate categories in Class:
#T_CATEGORIES="['one','two','three','four']"
# This will set the default direction of text flow on new groups.
T_LANG_DIRECTION="ltr"
# Wether or not to use legacy parts of the system marked for deprecation. At the moment this is important for older clients that upload to an old route.
T_LEGACY="false"
# Override the default new group content with your own custom content folder.
T_DEV_CONTENT="$(pwd)/client/content/default"
# Override the docker image version of Tangerine to use. Note you must also check out that version in git.
T_TAG=""

# @TODO Deprecated? 
T_SYNC_SERVER="localhost:5984"
T_COUCHDB_ENDPOINT="http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASS@couchdb:5984/"
T_COUCHDB_ENABLE="true"
T_COUCHDB_LOCAL="true"


