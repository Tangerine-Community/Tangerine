sudo apt-get update

# git is used for updating
sudo apt-get install git -y

# install JDK and Android SDK
sudo apt-get install default-jdk -y
curl http://dl.google.com/android/android-sdk_r24.3.4-linux.tgz > android-sdk.tgz
tar xvf android-sdk.tgz
sudo mv android-sdk-linux /usr/local/bin

# do this manually
# /usr/local/bin/android-sdk-linux/tools/android list sdk --all
# /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a -t 1,2,6,26

# node
sudo apt-get install nodejs npm -y

npm install