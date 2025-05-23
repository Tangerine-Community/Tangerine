#
# Required to change!
#
# You must change the following passwords or else bots will find and hack your site! 
# These settings are only set when you run start.sh of Tangerine. Restarting your docker container will not refresh
# these settings.
#
# Also, changing settings after first start.sh may result in your tablets losing ability to upload, reports unable to generate,
# and many other potential issues depending on the setting. To change settings, you will need to start a new server and install
# tangerine on that new server with the desired settings, then migrate uploaded data to a your new server installation.
#

# Domain name of the Tangerine installation. If doing local development without ngrok, use 127.0.0.1, not localhost.
T_HOST_NAME='example.com'
T_MAINTAINER_EMAIL="do-not-reply@tangerinecentral.org"
# Set to HTTPS for redirecting any requests to https. However you will need to put a reverse proxy with SSL in front.
T_PROTOCOL="http"
# Administrator User for logging into Tangerine -- Do not change the username until after the first login
T_USER1="user1"
T_USER1_PASSWORD="password"
# If using Sync Protocol 1, this is the password tablets will use to authenticate when uploading data.
T_UPLOAD_TOKEN="password"
# The database username and password. Please make this extrememly secure.
T_COUCHDB_USER_ADMIN_NAME="admin"
T_COUCHDB_USER_ADMIN_PASS="password"
# Mysql - Enter container name - usually "mysql" or the ip address or server name for an external service.
T_MYSQL_CONTAINER_NAME="mysql"
T_MYSQL_USER="admin"
T_MYSQL_PASSWORD="password"
T_MYSQL_PHPMYADMIN="FALSE"
# Enter "true" if using a mysql container instead of an external database service such as AWS RDS. This will launch a mysql container.
T_USE_MYSQL_CONTAINER=""

#
# Optional
#

# Available modules: csv, logstash, class, case, sync-protocol-2
# To enable modules, list them like so: 
# T_MODULES="['csv','class','logstash','sync-protocol-2']"
T_MODULES="['csv']"

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

# Number of change docs from the Couchdb changes feed queried by reporting-worker (i.e. use as the limit parameter)
T_LIMIT_NUMBER_OF_CHANGES=200

# Limit processing to certain group dbs. Cache clear and batching reporting outputs will only run on the groups specified below.
# If empty, all groups will be processed.
# The value of the paramter is an array of group names. For example:
# T_ONLY_PROCESS_THESE_GROUPS="['group-1','group-2']"
T_ONLY_PROCESS_THESE_GROUPS=""

# When CSV is generated, this determines how many form responses are held in memory during a batch. The higher the number the more memory this process will take but the faster it will complete. 
T_CSV_BATCH_SIZE=50

# Determines whether only user1 can add and see sitewide users or all admin users can. If false, all admin users can add and see sitewide users.
T_USER1_MANAGED_SERVER_USERS="false"

# On client, prevent users from editing their own profile.
T_HIDE_PROFILE="false"

# Sync Protocol 1 Only: On device registration, after user creates account, will force user to enter 6 character code that references online account.
T_REGISTRATION_REQUIRES_SERVER_USER="false"

# Sync Protocol 1 Only: On client sync, will result in any changes made to a user profile on the server to be downloaded and reflected on the client.
# This setting only works with new groups being created.
T_CENTRALLY_MANAGED_USER_PROFILE="false"

# User Short Code Length: The length of the short code that is used to import data to a device from the user id. Default is 6.
T_USER_SHORT_CODE_LENGTH=6

# Sync Protocol 1 Only: Don't do a GET before a PUT when uploading.
T_UPLOAD_WITHOUT_UPDATING_REV="true"

# Auto Commit will make a commit in every group's content folder at a specified frequency. Changes are only committed if there is a change.
T_AUTO_COMMIT="true"
# How often a commit is made in milliseconds.
T_AUTO_COMMIT_FREQUENCY="60000"

# Add replication entries in this array to start on server boot in 
# format of `{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}`
T_REPLICATE="[]"

# To populate categories in Class:
#T_CATEGORIES="['one','two','three','four']"

# Wether or not to use legacy parts of the system marked for deprecation. At the moment this is important for older clients that upload to an old route.
T_LEGACY="false"

# Override the docker image version of Tangerine to use. Note you must also check out that version in git.
T_TAG=""

# Enforce Android tablet orientation. Options for T_ORIENTATION are at https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation
T_ORIENTATION="any"

# Set to false if you would like to use the skip-if functionality in editor. You would want to use skip-if as opposed to show-if if your form developers are stashing values in hidden fields.
T_HIDE_SKIP_IF="true"

# In outputs, set cell value to this when something is skipped due to skip logic.
T_REPORTING_MARK_SKIPPED_WITH="SKIPPED"

# In outputs, set cell value to this when something is optional and not answered.
T_REPORTING_MARK_OPTIONAL_NO_ANSWER_WITH="SKIPPED"

# In outputs, set cell value to this when something is disabled or hidden. Set to "ORIGINAL_VALUE" if you want the actual value stored.
T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH="ORIGINAL_VALUE"

# In outputs, set cell value to this when something is undefined. Set to "ORIGINAL_VALUE" if you want the actual value stored.
T_REPORTING_MARK_UNDEFINED_WITH="UNDEFINED"

# Set to true if you want Tangerine to ignore any settings in Sync Configuration and use Couchdb Sync for replication.
T_COUCHDB_SYNC_4_ALL="false"

# Set to false if you would not want to archive APKs to Disk when creating a release
T_ARCHIVE_APKS_TO_DISK="true"
# Set to false if you would not want to archive PWAs to Disk when creating a release
T_ARCHIVE_PWAS_TO_DISK="true"


# Custom HTML to place on the login page of the server.
T_CUSTOM_LOGIN_MARKUP=''

# The value to use for issuer parameter when signing JWTs.
T_JWT_ISSUER="Tangerine"
# The validity period for a signed JWT Token - determines how long before a token is conidered invalid. Expressed in seconds or a string describing a time span as defined in https://github.com/zeit/ms
T_JWT_EXPIRES_IN="1h"

# Password Policy
T_PASSWORD_POLICY="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#$%^&\*()\-_=+<>,.;:|[\]{}])(?=.{8,})"
T_PASSWORD_RECIPE="Password must contain at least 1 lowercase alphabetical character, at least 1 uppercase alphabetical character,
at least 1 numeric character, at least one special character ( ~ ! @ # $ % ^ & \* ( ) - _ = + < > , . ; : | [ ] { } ),
and must be eight characters or longer"

# Array of origins that are allowed to make requests to this server. Useful if you have an outside browser based app on a different origin that needs to make calls back to this server. See Express Cors Options Origin setting for possible values. https://expressjs.com/en/resources/middleware/cors.html#configuration-options
# Example usage. Note the forward slashes before double quotes are required otherwise bash filters them out and it won't be valid JSON.
# T_CORS_ALLOWED_ORIGINS='[\"http://localhost:8080\"]'
T_CORS_ALLOWED_ORIGINS=''

#
# Development
#

T_NGROK_AUTH_TOKEN=""
T_NGROK_SUBDOMAIN=""

