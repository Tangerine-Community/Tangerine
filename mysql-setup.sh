#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

USER_EXISTS=$(docker exec mysql mysql -u root -p"$T_MYSQL_PASSWORD" -sse "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '$T_MYSQL_USER')")

if [ "$USER_EXISTS" = 1 ]; then
  echo "MySQL user is already set up."
else
  echo "Setting up mysql user..."
  CMD="docker exec mysql mysql -u root -p'$T_MYSQL_PASSWORD' -e \"CREATE USER '$T_MYSQL_USER'@'%' IDENTIFIED WITH mysql_native_password BY '$T_MYSQL_PASSWORD';\""
  eval ${CMD}
  CMD="docker exec mysql mysql -u root -p'$T_MYSQL_PASSWORD' -e \"GRANT ALL PRIVILEGES ON \"*.*\" TO '$T_MYSQL_USER'@'%' WITH GRANT OPTION;\""
  eval ${CMD}
fi