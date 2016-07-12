
#
# Required to change
#

# T_HOST_NAME is the URL without protocol (like http://) you will be accessing your Tangerine server at.
T_HOST_NAME='xxx.x.x.x'

# T_USER1 is the username of the first user you will log in as. It is also the super user that has all permissions. 
T_USER1="user1"
T_USER1_PASSWORD="password"

# T_ADMIN is the admin user for your database. Make sure to change this so the outside world does not have access.
T_ADMIN="admin"
T_PASS="password"

#
# Optional to change
#

# TANGERINE_SERVER_VERSION is the version that the start.sh and uprgrade.sh script will use when installing Tangerine-server.
TANGERINE_VERSION="latest"
# If you are not on an Ubuntu system, change this to be a path of somewhere else to store data.
T_VOLUMES="/home/ubuntu/data/"
# If you have set up SSL on your server, you must change this to "https".
T_PROTOCOL="http"
# If you would like to run your own Tree server, you can change that here.
T_TREE_HOSTNAME="/"
T_TREE_URL="/tree"
