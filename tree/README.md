# docker-tangerine-tree

Creates an instance ot Tangerine-tree

# Instance settings

To build APK's using the makeApkDeprecated method, pass T_ADMIN and T_PASS using the environment switch when you run it:

docker run -d -p 80:80 -e T_ADMIN='username' -e T_PASS='password' -e T_COUCH_HOST='host.org' -e T_COUCH_PORT='5984' --name tangerine-tree-container -v /var/log tangerine/docker-tangerine-tree 

# Gettings started with Docker

Run the prebuilt image.
```
docker run -d --name tangerine-tree-container -p 80:80 tangerine/docker-tangerine-tree
```
Now add an entry to our `/etc/hosts` file to point to the IP address of your Docker so that it responds at the hostname of `local.tangerinecentral.org`.  Then go to `http://local.tangerinecentral.org/` in your browser.

Sandbox time! Run the prebuilt image but override it with your local code. Here's an example that works on R.J.'s laptop. The path to the code folder will be different for you. Just make sure you make that an absolute path, not relative like `./`. 
```
docker run -d --name tangerine-tree-container -p 80:80 --volume /Users/rsteinert/Github/Tangerine-Community/docker-tangerine-tree/:/root/Tangerine-tree tangerine/docker-tangerine-tree
```

Build the image yourself.
```
docker build -t tangerine/docker-tangerine-tree .
```

Push up your new image.
```
docker push tangerine/docker-tangerine-tree 
```

If you get an error when pushing to your own repository, login first
```
docker login
```
Run the container with environment variables that also has data volumes for couchdb and logs.
```
docker run -d -p 80:80  --name tangerine-tree-container -v /var/log tangerine/docker-tangerine-tree
```
Get into a running container to play around.
```
docker exec -it tangerine-tree-container /bin/bash 
```

Is the container crashing on start so the above isn't working? Override the entrypoint command to start the container with just `/bin/bash`. 
```
docker run -it --entrypoint=/bin/bash tangerine/docker-tangerine-tree
```

# First run caveats

## First run download too long

The first time you attempt the generate an APK, the app must download crosswalk plugin and compile. This may exceed the nginx 
setting. Also, check your AWS ELB timeout setting - try setting it to 300 seconds. Also, if it still fails, click APK again.

## Incomplete javascript

Sometimes on the first run the app does not completely compile the app's javascript. When you install the app, you'll see 
a screen with no Assessments and "Uncaught ReferenceError: TangerineVersion is not defined" in the js debugger.

To fix this issue:

````
cd /root/Tangerine-tree/tree/client
npm start
````

This will build, compile, and minify the js. Once it displays "Finished 'default'" you may terminate the program. 

# Developing the client app

Do not develop using the code in the client directory; instead, check out [Tangerine](https://github.com/Tangerine-Community/Tangerine) 
and develop from that repository's client. Once you are done, copy client back into this respository and tag. 

Happy coding!
