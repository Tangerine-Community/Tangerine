# Tangerine-server

## Getting started

To run this server, [install docker](https://docker.io) and then run the following command with strings encapsulated in angle brackets replaced with your own custom settings.  
```
docker run -d \
  --env "T_PROTOCOL=<protocol to reach the server, either http or https>" \
  --env "T_USER1=<username for the first user>" \
  --env "T_USER1_PASSWORD=<password for the first user>" \
  --env "T_HOST_NAME=<url of the server without protocol>" \
  --volume <path to a folder to save data>:/var/lib/couchdb \
  -p 80:80 \
  --name tangerine-server-container \
  tangerine/tangerine-server:latest
```

For example...
```
docker run -d \
  --env "T_PROTOCOL=http" \
  --env "T_USER1=user1" \
  --env "T_USER1_PASSWORD=mysecretpassword" \
  --env "T_HOST_NAME=192.168.99.100" \
  --volume /Users/rsteinert/Docker/tangerine-server-container/couchdb:/var/lib/couchdb \
  -p 80:80 \
  --name tangerine-server-container \
  tangerine/tangerine-server:latest
```

To upgrade your server, run the following commands followed by the same docker run command from above.
```
docker stop tangerine-server-container
docker rm tangerine-server-container
docker pull tangerine/tanerine-server:latest
```


## Developers 

To develop on Mac or Windows, this project requires a working knowledge of `docker` and `docker-machine`. While you can issue Docker commands from Windows or Mac, Docker containers cannot run directly run on those platforms (yet) so it requires connecting to another machine running Linux using the `docker-machine` command. To learn Docker, check out the [self-paced training on docker.io](https://training.docker.com/self-paced-training). 

Now that your `docker` command is connected to Linux machine, get the code, build it, and run it. This first build will take up to 30 minutes depending on your Internet connection, processor power, and memory of your host machine. Future builds will be much faster because of the "Docker cache" you will be building on this first run. 
```
git clone git@github.com:Tangerine-Community/Tangerine-server.git
cd Tangerine-server
docker build -t tangerine/tangerine-server:local .
docker run -d \
  --env "T_PROTOCOL=<protocol to reach the server, either http or https>" \
  --env "T_USER1=<username for the first user>" \
  --env "T_USER1_PASSWORD=<password for the first user>" \
  --env "T_HOST_NAME=<url of the server without protocol>" \
  --volume <path to a folder to save data>:/var/lib/couchdb \
  -p 80:80 \
  --name tangerine-server-container \
  tangerine/tangerine-server:local
```

Now that you've built and run an image tagged as `local`, view your server from a web browser to confirm it is working and follow the logs with the following command.

```
docker logs -f tangerine-server-container
```

If all is well, you can stop following the logs with `ctrl-c` and it's now time to make a code change and see that reflected in your browser. For example, edit `./editor/app/_attachments/index.html` and change the text in the `<title>` tag to be something like `<title>Hello Tangerine</title>`. If you reload your your browser you'll notice that the title tag has not changed. That's because the code your browser is viewing is based on the built image we made before the code change. To see our that change in the code we'll need to build and run the image again. 

```
docker build tangerine/tangerine-server:local .
docker stop tangerine-server-container
docker rm tangerine-server-container
docker run -d \
  --env "T_PROTOCOL=<protocol to reach the server, either http or https>" \
  --env "T_USER1=<username for the first user>" \
  --env "T_USER1_PASSWORD=<password for the first user>" \
  --env "T_HOST_NAME=<url of the server without protocol>" \
  --volume <path to a folder to save data>:/var/lib/couchdb \
  -p 80:80 \
  --name tangerine-server-container \
  tangerine/tangerine-server:local
```

Now follow the logs again and check your browser. If all is well, you should now see the title of the web page as "Hello Tangerine".

## Other notes
You can also specify the tree service:

    -e "T_TREE_URL=http://cktree.tangerinecentral.org"

Get into a running container to play around.
```
docker exec -it tangerine-server-container /bin/bash 
```

Is the container crashing on start so the above isn't working? Override the entrypoint command to start the container with just `/bin/bash`. 
```
docker run -it --entrypoint=/bin/bash tangerine/tangerine-server
```

