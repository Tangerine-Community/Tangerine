#!/usr/bin/env bash
# editor

set -v # set verbose

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# curl
if [ ! -z "`which curl`" ]; then
  echo "curl already installed"
else
  sudo apt-get install curl -y
fi

# couchapp
if [ ! -z "`which couchapp`" ]; then
  echo "couchapp already installed"
else
  sudo apt-get install python-dev -y
  curl https://bootstrap.pypa.io/get-pip.py > tmp/get-pip.py
  sudo python tmp/get-pip.py
  sudo pip install couchapp
fi

couchdb -k
couchdb -b

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi


# hand it over to the gulp file
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir
npm install

sed "s/\INSERT_HOSTNAME/"$T_HOSTNAME"/g" app/_docs/configuration.template > app/_docs/configuration.json

npm start init

cd app
couchapp push
