#!/usr/bin/env bash
# packager

set -v # set verbose

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo dir = $dir
cd $dir
npm install

