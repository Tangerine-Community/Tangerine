#!/usr/bin/env bash
# tree

set -v # set verbose

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# JDK
if [ ! -z "`which javac`" ]; then
  echo "JDK already installed"
else
sudo apt-get install default-jdk -y
#sudo dpkg -i /root/Tangerine-server/tmp/openjdk-7-jre-headless_7u95-2.6.4-0ubuntu0.14.04.1_amd64.deb
#sudo apt-get -fy install
fi

# curl
if [ ! -z "`which curl`" ]; then
  echo "curl already installed"
else
  sudo apt-get install curl -y
fi

# Android SDK
#if [ ! -z "`which android`" ]; then
#  echo "Android SDK already installed"
#else
#  curl http://dl.google.com/android/android-sdk_r24.3.4-linux.tgz > tmp/android-sdk.tgz
#  sudo mkdir /usr/local/bin/android-sdk-linux
#  sudo tar xvf tmp/android-sdk.tgz -C /usr/local/bin
#  # sudo tar xvf /root/Tangerine-server/tmp/android-sdk_r24.4.1-linux.tgz -C /usr/local/bin
#  sudo chown -R $USER:$USER /usr/local/bin/android-sdk-linux
#  sudo chmod a+x /usr/local/bin/android-sdk-linux/tools/android
#  export PATH=$PATH:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools
#  sudo sh -c "echo \"export PATH=$PATH:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools \nexport ANDROID_HOME=/usr/local/bin/android-sdk-linux\" > /etc/profile.d/android-sdk-path.sh"
#
#  # Install Android SDK's tools
#  echo "y" | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "android-23, android-22,tools,platform-tools,extra-android-support,extra-android-m2repository,extra-google-m2repository, build-tools-23.0.2"
##  android update sdk --no-ui --filter platform-tools,build-tools-19.0.1,android-19,extra-android-support,extra-android-m2repository,extra-google-m2repository
#
#
#  # required on 64-bit ubuntu
#  sudo dpkg --add-architecture i386
#  sudo apt-get -qqy update
#  sudo apt-get -qqy install libncurses5:i386 libstdc++6:i386 zlib1g:i386
#fi

# node
if [ ! -z "`which node`" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo pwd = $(pwd)
cd $dir
npm install

cd client
echo pwd = $(pwd)

npm install
# workaround for sudo
npm run tree-postinstall
# fix for Error: setgid group id does not exist
sed -i'' -r 's/^( +, uidSupport = ).+$/\1false/' /usr/lib/node_modules/npm/node_modules/uid-number/uid-number.js