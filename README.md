# Tangerine-server

This repo is meant to contain submodules references to each component required for the tangerine server, removing some manual steps to Tangerine server installation.

# Getting started

```shell
adduser inst
usermod inst -a -G sudo
su inst
sudo apt-get update
sudo apt-get install git
cd ~
git clone http://github.com/also-engineering/server.git
cd server
vim tangerine.conf # add your domain name
./server-init.sh
```

Once executed there are a couple of prompts that are hard to automate surrounding the installation of the Android SDK. 

# Updating on the server

`git pull && git submodule update`

# Considerations

This repo can be thought of as an example for a deployment script. It relies heavily on submodules, so if you're doing development you will need to fork your own submodules, and `git add https://github.com/your-org/submodule` to fit this.