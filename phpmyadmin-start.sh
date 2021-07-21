
#
# Load config.
#

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

[ "$(docker ps | grep phpmyadmin)" ] && docker stop phpmyadmin
[ "$(docker ps -a | grep phpmyadmin)" ] && docker rm phpmyadmin 

docker run --name phpmyadmin -d --link $T_MYSQL_CONTAINER_NAME:db -p 8080:80 phpmyadmin

