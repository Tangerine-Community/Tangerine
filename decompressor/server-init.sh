#!/usr/bin/env bash -v
# decompressor

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

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "decompressor dir is $dir"
cd $dir
npm install
