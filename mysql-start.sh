
#
# Load config.
#

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi


if [ ! -d data ]; then
  mkdir data
fi
if [ ! -d data/mysql ]; then
  mkdir data/mysql
fi
if [ ! -d data/mysql/databases ]; then
  mkdir data/mysql/databases
fi
if [ ! -d data/mysql/state ]; then
  mkdir data/mysql/state
fi


[ "$(docker ps | grep $T_MYSQL_CONTAINER_NAME)" ] && docker stop $T_MYSQL_CONTAINER_NAME
[ "$(docker ps -a | grep $T_MYSQL_CONTAINER_NAME)" ] && docker rm $T_MYSQL_CONTAINER_NAME


docker run --name "$T_MYSQL_CONTAINER_NAME" -v "$(pwd)/data/mysql/databases:/var/lib/mysql" -p 3306:3306 -e "MYSQL_ROOT_PASSWORD=$T_MYSQL_PASSWORD" -d mysql:latest


