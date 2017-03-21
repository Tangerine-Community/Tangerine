#!/usr/bin/env bash
# robbert

set -v # set verbose

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

npm install

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
  curl -O https://bootstrap.pypa.io/get-pip.py
  sudo python get-pip.py
  sudo pip install couchapp
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir
npm install

cd $dir/couchapp
couchapp push
