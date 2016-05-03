#!/usr/bin/env bash
# editor

set -v # set verbose

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

# hand it over to the gulp file
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

npm start init
