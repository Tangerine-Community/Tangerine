# Tangerine-server

This repo is meant to contain submodules references to each component required for the tangerine server, removing some manual steps to Tangerine server installation.

# Getting started

Make a user, give it sudo powers, switch to that user

```shell
adduser inst && usermod inst -a -G sudo && su inst
```

Update apt, get git, clone this repo

```shell
sudo apt-get update && sudo apt-get install git -y && cd ~ && git clone http://github.com/also-engineering/server.git && cd server
```

Edit some configuration variables.

```shell
vim ./tangerine-env-vars.sh
```

Kick it off

```shell
./server-init.sh
```

When this finishes you should be able to go to the hostname that you provided during configuration, which should redirect you to the appropriate CouchApp url.

# Updating on the server

`git pull && git submodule update`

# Considerations

This repo can be thought of as an example for a deployment script. It relies heavily on submodules, so if you're doing development you will need to fork your own submodules, and `git add https://github.com/your-org/submodule` to fit this.

For example. Once you have set up your server with the scripts in this repo, you can then replace any of the repos with whatever repo you like.

Happy coding!