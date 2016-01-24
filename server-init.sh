#!/usr/bin/env bash
# server

set -v

git submodule init && git submodule update

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# install tangerine's env vars
if [ ! -f /etc/profile.d/tangerine-env-vars.sh ]; then
  dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
  vim $dir/tangerine-env-vars.sh
  sudo cp $dir/tangerine-env-vars.sh /etc/profile.d/
  source /etc/profile
fi

# install nginx
if [ ! -z "`which nginx`" ]; then
  echo "nginx already installed"
else
  sudo apt-get install nginx -y
fi

# nginx config
if [ ! -a /etc/nginx/sites-enabled/tangerine.conf ]; then
  sudo -E sed "s/\INSERT_HOSTNAME/"$T_HOSTNAME"/g" tangerine-nginx.template > /etc/nginx/sites-enabled/tangerine.conf
  sudo rm /etc/nginx/sites-enabled/default
  # increase the size limit of posts
  sudo sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf
  sudo service nginx restart
fi


# couchdb
if [ ! -z "`which couchdb`" ]; then
  echo "CouchDB already installed"
else
  sudo apt-get install python-software-properties -y
  sudo apt-add-repository ppa:couchdb/stable
  sudo apt-get update
  sudo apt-get install couchdb couchdb-bin couchdb-common -y

  # create server admin
  sudo -E sh -c 'echo "$T_ADMIN = $T_PASS" > /etc/couchdb/local.ini'

fi

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

sudo service couchdb restart

sudo env PATH=$PATH:/usr/local/bin pm2 startup -u $USER

if [ -d "/home/$USER/.rvm" ]; then
  source $(rvm 2.2.0 do rvm env --path)
  rvmsudo -E bash -c 'pm2 start ecosystem.json'
else
  sudo -E bash -c 'pm2 start ecosystem.json'
fi