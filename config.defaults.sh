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
# If it is a hub instance, use "${T_CONTAINER_NAME}-couchdb" ; otherwise, "couchdb"
T_COUCHDB_CONTAINER_NAME="couchdb"
# Open port to couchdb. Leave empty if this is a hub deployment.
T_COUCHDB_PORT_MAPPING=" -p 5984:5984"
# Open additional ports. You probably don't need to do this.
T_PORT_MAPPING="-p 80:80"
# Control wether or not the limit of reporting output is per group or sidewide. The other option is "group" which will make sure allowance applies to the group level.
T_PAID_MODE="site"
# The number of form responses uploaded that will be marked paid thus end up in the reporting outputs.
T_PAID_ALLOWANCE="unlimited"
# Reporting delay determines how quickly uploads will get processed and show up in reporting outputs such as CSV. Time is in milliseconds and default is 5 minutes.
T_REPORTING_DELAY="300000"
# When CSV is generated, this determines how many form responses are held in memory during a batch. The higher the number the more memory this process will take but the faster it will complete. 
T_CSV_BATCH_SIZE=50
# Determines wether only user1 can add and see sitewide users or all users can.
T_USER1_MANAGED_SERVER_USERS="false"
# On client, prevent users from editing their own profile.
T_HIDE_PROFILE="false"
# On device registration, after user creates account, will force user to enter 6 character code that references online account.
T_REGISTRATION_REQUIRES_SERVER_USER="false"
# On client sync, will result in any changes made to a user profile on the server to be downloaded and reflected on the client.
T_CENTRALLY_MANAGED_USER_PROFILE="false"
# Add replication entries in this array to start on server boot in 
# format of `{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}`
T_REPLICATE="[]"
# Available modules: csv, logstash, class
# To enable modules, list them like so: 
# T_MODULES="['csv','class', 'logstash']"
T_MODULES="['csv']"
# To populate categories in Class:
#T_CATEGORIES="['one','two','three','four']"
# Wether or not to use legacy parts of the system marked for deprecation. At the moment this is important for older clients that upload to an old route.
T_LEGACY="false"
# Override the docker image version of Tangerine to use. Note you must also check out that version in git.
T_TAG=""
# Enable use of a remote CouchDB 
T_COUCHDB_ENDPOINT="http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASS@couchdb:5984/"
T_COUCHDB_LOCAL="true"


