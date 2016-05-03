#!/usr/bin/env bash
# brockman

set -v # set verbose

# bundler
if [ ! -z "`which bundler`" ]; then
  echo "bundler already installed"
else
  sudo apt-get install bundler libsqlite3-dev -y
  gem install bundler
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir
bundle install --path vendor/bundle
