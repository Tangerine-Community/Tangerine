# Setting Up Your Sandbox for Tangerine Development 

## Create your sandbox
Install Docker on your machine. Now that you have Docker on your machine it's time to get the code, but before you download the code, you will want to "fork it". Go to https://github.com/Tangerine-Community/Tangerine and click on the "Fork" button. Choose to fork the repository into your own personal Github account. From your forked version of the code, copy the clone URL and issue the following commands.

```
git clone <your clone url>
cd Tangerine
./develop.sh
```
You'll see the logs wizzing by. When things have finally calmed down you will see `Finished 'default'` for a second time, go to http://localhost/ in your web browser and log in with username of `user1` and password of `password`. Create your first group by clicking on "groups", then click on "account", then "Join or create a group", fill out "Group name" as "g1", click "Join Group", click "Back", and then click "g1". You are now in your first group. You'll notice a `data` directory in your Tangerine directory that contains data for your container. That folder of data ensures that between runs of `./develop.sh` your data will persist. If you want to start with a blank slate, delete it or move it away to another place. 

Note: This is the easiest method for development but results in a sandbox where only changes to `./editor/src/js` and `./client/src/js` are reflected in your container. For other methods of sandbox development, see the alternatives below.


## Load test data 
To load some test data, create a group called `g1` and then run the following command. 
```
docker exec tangerine-container tangerine push-backup --path /tangerine-server/client/test/packs --url http://user1:password@127.0.0.1:5984/group-g1
```



## Alternative Sandbox Approaches
There are 4 different ways to approach development. , method 3 is quite fast but requires a very good working knowledge of Docker, Linux, Git, and how the underlying software is bootstrapped together, and method 4 is often difficult to set up even if you have a fresh server. After you get your sandbox set up, proceed to the "Load test data into your sandbox" section at the bottom. 



### Alternative Approach 1: Build and run
This method is quite easy and very reliable. You simply run the `./build-and-run.sh` script every time you change the code and Docker. The first time you do this, it will take a while as the Docker cache is built for this image. After that cache is built, the Docker build process will pick up where a file that has changed gets added. That means that if you only change a front end Javascript file that gets added near the end of the build process, the entire part of the build process where dependencies like git are installed can be skipped. We still have some optimization that could be done in the Dockerfile though, at the moment __both__ client and editor will be compiled any time any code changes in the repository. 

```
git clone <your fork url>
cd Tangerine
./build-and-run.sh
```

Now that you've built and run an image tagged as `local`, view your server from a web browser to confirm it is working. When you visit the site in a web browser, you will see output to your terminal indicating there is activity on the server. You are now ready to start modifying code. We use the Edit-Build-Run workflow. That means everytime you edit code, you will build and run the code with the `build-and-run.sh` script. If you make an edit that breaks the build, you will see that in the output in your terminal. If all is well, you can stop following the logs with `ctrl-c` and it's now time to make a code change and see that reflected in your browser. For example, edit `./editor/app/_attachments/index.html` and change the text in the `<title>` tag to be something like `<title>Hello Tangerine</title>`. If you reload your your browser you'll notice that the title tag has not changed. That's because the code your browser is viewing is based on the built image we made before the code change. To see our change run `./build-and-run.sh` again.

Now follow the logs again and check your browser. If all is well, you should now see the title of the web page as "Hello Tangerine".

Tip: To speed up your first run of `build-and-run.sh`, take advantage of Docker Cache by downloading an already built image and copy it to the `tangerine/tangerine:local` tag that the `build-and-run.sh` script will build. Ex. `docker pull tangerine/tangerine:master; docker tag tangerine/tangerine:master tangerine/tangerine:local`. Note that this only works with Docker 1.9 and earlier because in newer versions of Docker, `docker pull` [does not pull the Docker Cache](https://github.com/docker/docker/issues/20316)..  



### Alternative Approach 2: Testing code inside of a container

This goes against the grain of how Docker ethos: you should not modify the code inside your docker instance. In this case,
we're making a trade-off due to the difficulties of developing this docker container locally.

Follow the instructions in the Developers section. Get into a running container to play around.

```
docker exec -it tangerine-server-container /bin/bash
```

Go to the code for editor:

````
cd /tangerine-server/editor
npm run debug

````

This npm command will run the debug gulp command and watch for changes
in your code. You may access the app from the index-dev.html page, which makes debugging much easier.

SSH into another console to your server , docker exec into the same instance, edit your code.

Please note: you must create a new group when you wish to view your changes.

Be sure to commit your code ASAP. Once your container is gone; any uncommitted changes will also be gone.

### Developing code on your local development environment

Lastly, you can develop some parts of the Tangerine codebase without spinning up a docker container. Instructions for modifying parts of Tangerine follow:

#### Editor

Editor is served as a single page application by Robbert. Before launching Robbert, add the following variables to your environment:

    T_ADMIN=Couch db admin
    T_PASSWORD=Couch password
    T_ROBBERT_PORT=4444
    T_HOSTNAME=localhost
    T_PROTOCOL=http

If this is the first time launching editor, you must init the app. Go to the code for editor:

````
cd /tangerine-server/editor
npm install
cd /tangerine-server/editor/app
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/configuration.template | sed "s#INSERT_TREE_URL#"$T_TREE_URL"#g" | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/configuration.json
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/settings.template | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/settings.json
couchapp push
npm run debug
````

This npm command will run the debug gulp command and watch for changes
in your code. You may access the app from the index-dev.html page, which makes debugging much easier.
Push the Robbert couchapp to populate byRoleKey view to the _users database:

    cd /tangerine-server/robbert/couchapp
    couchapp push

Launch Server:

````
cd /tangerine-server/server
npm install
npm start

````

Launch Raisin:

````
cd /tangerine-server/raisin
npm install
nodemon microservices/raisin/server.js

````

To get the pieces to work under a single url, install nginx and copy tangerine.conf into its configuration directory.

Go to http://localhost/app/tangerine/index.html to view the app
Futon is at http://localhost/db/_utils/#

#### Configuring the client app

As mentioned above, you should develope client here and copy to docker-tangerine-tree. If you are running docker-tangerine-tree
on your own server, you must configure the relevant urls in the Content-Security-Policy section of index.html:

````
    <meta http-equiv="Content-Security-Policy"
          content="default-src *;
          style-src 'self' 'unsafe-inline';
          script-src 'self' https://*.tangerinecentral.org 'unsafe-inline' 'unsafe-eval' ;
          img-src 'self' data:;
          connect-src 'self' https://*.tangerinecentral.org data: blob: filesystem:">
````



