#!/usr/bin/env bash
# brockman

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

# rvm
if [ ! -z "`which rvm`" ]; then
  echo 'rvm already installed'
else
  gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
  curl -sSL https://get.rvm.io | bash -s stable
  source /home/$USER/.rvm/scripts/rvm

  # set secure path options
  if sudo grep -q secure_path /etc/sudoers; then sudo sh -c "echo export rvmsudo_secure_path=1 >> /etc/profile.d/rvm_secure_path.sh" && echo Environment variable installed; fi
  source /etc/profile

  # install ruby
  rvm install ruby-2.2.0
  rvm install ruby-2.2.0-dev
  rvm --default use ruby-2.2.0

fi

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
