#!/bin/bash
# robbert

set -v # set verbose

sudo apt-get update
export updated_recently=TRUE
sudo apt-get install curl -y

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install


sudo apt-get install python-dev -y
curl -O https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py
sudo pip install couchapp

