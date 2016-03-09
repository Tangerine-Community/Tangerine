#!/usr/bin/env bash
# server

set -v

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# install tangerine's env vars
#if [ ! -f /etc/profile.d/tangerine-env-vars.sh ]; then
#  dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#  sudo cp $dir/tangerine-env-vars.sh /etc/profile.d/
#  source /etc/profile
#fi

## install nginx
#if [ ! -z "`which nginx`" ]; then
#  echo "nginx already installed"
#else
#  sudo apt-get install nginx -y
#fi
#
## nginx config
#if [ ! -a /etc/nginx/sites-enabled/tangerine.conf ]; then
#  sudo -E sh -c "sed \"s/\T_HOSTNAME/$T_HOSTNAME/g;
#    s/T_COUCH_HOST/$T_COUCH_HOST/g;
#    s/T_COUCH_PORT/$T_COUCH_PORT/g;
#    s/T_ROBBERT_PORT/$T_ROBBERT_PORT/g;
#    s/T_TREE_PORT/$T_TREE_PORT/g;
#    s/T_BROCKMAN_PORT/$T_BROCKMAN_PORT/g;
#    s/T_DECOMPRESSOR_PORT/$T_DECOMPRESSOR_PORT/g\" tangerine-nginx.template > /etc/nginx/sites-available/tangerine.conf"
#  sudo ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf
#
#  sudo rm /etc/nginx/sites-enabled/default
#  # increase the size limit of posts
#  sudo sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf
#  sudo service nginx restart
#fi

# curl
#if [ ! -z "`which curl`" ]; then
#  echo "curl already installed"
#else
#  sudo apt-get install curl -y
#fi

# couchdb
#if [ ! -z "`which couchdb`" ]; then
#  echo "CouchDB already installed"
#else
#  sudo apt-get install software-properties-common -y
#  sudo apt-add-repository -y ppa:couchdb/stable
#  sudo apt-get update
#  sudo apt-get install couchdb -y
#  sudo chown -R couchdb:couchdb /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
#  sudo chmod -R 0770 /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
#  sudo mkdir /var/run/couchdb
#  sudo chown -R couchdb /var/run/couchdb
#  couchdb -k
#  couchdb -b
#
#  # create server admin
#  sudo -E sh -c 'echo "$T_ADMIN = $T_PASS" >> /etc/couchdb/local.ini'
#  couchdb -b
#
#  # Add the first user.
#  curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:user1" --data-binary '{"_id": "org.couchdb.user:user1","name": "user1","roles": [],"type": "user","password": "password"}'
#
#fi

couchdb -k
couchdb -b

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# pm2
if [ ! -z "`which pm2`" ]; then
  echo "pm2 already installed"
else
  sudo npm install -g pm2
fi

cd /root/Tangerine-server

if [ -a ./tree/server-init.sh ]; then
  ./tree/server-init.sh
fi

if [ -a ./decompressor/server-init.sh ]; then
  ./decompressor/server-init.sh
fi

 if [ -a ./brockman/server-init.sh ]; then
   ./brockman/server-init.sh
 fi

 if [ -a ./editor/server-init.sh ]; then
   ./editor/server-init.sh
 fi

 if [ -a ./robbert/server-init.sh ]; then
   ./robbert/server-init.sh
 fi

npm install -g pm2

echo "all done"
