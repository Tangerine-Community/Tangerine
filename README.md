# Tangerine-server

This repo is meant to contain submodules references to each component required for the tangerine server, removing some manual steps to Tangerine server installation.

# Gettings started with Docker

Run the prebuilt image.
```
docker run -d --name tangerine-server-container -p 80:80 tangerine/tangerine-server
```

Now add an entry to our `/etc/hosts` file to point to the IP address of your Docker so that it responds at the hostname of `local.tangerinecentral.org`.  Then go to `http://local.tangerinecentral.org/` in your browser.

Sandbox time! Run the prebuilt image but override it with your local code. Here's an example that works on R.J.'s laptop. The path to the code folder will be different for you. Just make sure you make that an absolute path, not relative like `./`. 
```
docker run -d --name tangerine-server-container -p 80:80 --volume /Users/rsteinert/Github/Tangerine-Community/Tangerine-server/:/root/Tangerine-server tangerine/tangerine-server
```

Build the image yourself.
```
docker build -t tangerine/tangerine-server .
```

Push up your new image.
```
docker push tangerine/tangerine-server 
```

Get into a running container to play around.
```
docker exec -it tangerine-server-container /bin/bash 
```

Is the container crashing on start so the above isn't working? Override the entrypoint command to start the container with just `/bin/bash`. 
```
docker run -it --entrypoint=/bin/bash tangerine/tangerine-server
```


# Getting started without Docker

Spin up an Ubuntu 14.04 machine and then ssh into it.

Update apt, get git, clone this repo.

```shell
sudo apt-get update && sudo apt-get install git -y && cd ~ && git clone http://github.com/Tangerine-Community/Tangerine-server.git && cd Tangerine-server
```

Copy the `tangerine-env-vars.sh.defaults` file to `tangerine-env-vars.sh`. Edit some configuration variables. Make sure T_HOSTNAME is the hostname that your app will be visited at. If you want to set the T_HOSTNAME to the IP address of the machine, you might do the following.

```shell
IP_ADDRESS=$(ifconfig eth0 | grep "inet addr" | awk '{print $2}' | awk -F ':' '{print $2}')
sed "s/T_HOSTNAME=localhost/T_HOSTNAME=$IP_ADDRESS/" tangerine-env-vars.sh.defaults > tangerine-env-vars.sh
```

Kick it off

```shell
./server-init.sh
```

When this finishes you should be able to go to the hostname that you provided during configuration, which should redirect you to the appropriate CouchApp url. A default user of user1:password has been created for you. Log in and create a group.

# Updating on the server

`git pull && git submodule update`

# Considerations

This repo can be thought of as an example for a deployment script. It relies heavily on submodules, so if you're doing development you will need to fork your own submodules, and `git add https://github.com/your-org/submodule` to fit this.

For example. Once you have set up your server with the scripts in this repo, you can then replace any of the repos with whatever repo you like.

Happy coding!
