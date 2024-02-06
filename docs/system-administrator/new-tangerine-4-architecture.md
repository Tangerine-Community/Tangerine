# New Tangerine 4.0 Architecture

Tangerine 4.0 features a new architecture which offers greater security and resiliency for the application. The new design breaks Tangerine down into five containers, which are described in the docker-compose.yml file. 

- init - creates new directories and initializes key.
- server-ui - a NEST.js app that serves the editor interface. 
  - Available at port 81 inside the tangerine_default network.
  - ./Dockerfile-server-ui
- server - backend support for the editor user interface. 
  - Available at port 82 inside the tangerine_default network
  - ./Dockerfile-server
- apk-generator - alpine-based container with Android libs to build APK's and PWA's.
  - Available at port 83 inside the tangerine_default network
  - ./Dockerfile-apk
- nginx - reverse proxy that services requests for server and server-ui at port 80. Config files at nginx/default.conf
  - Exposes all Tangerine services at port 80
  - ./nginx/Dockerfile
- couchdb - database server for server
  - Available at port 5984 and /db on port 80 inside the tangerine_default network
  - ./Dockerfile-couchdb
  - Data persisted at ./data/couchdb/data
  - Futon is accessible at https://FOO.DOMAIN/db/_utils/index.html
  - Update admin password in ./couchdb/local.ini in the [admins] section.

# Configuration

Older versions of Tangerine used a config.sh for configuration. The new version uses a config.env file. Copy config.defaults.env to config.env and change T_HOST_NAME. If you're planning to upload data from a client, set:
 - T_PROTOCOL="https"
If migrating from an older version of Tangerine, rename config.sh to config.env. It's a better idea to start fresh because there may be new properties introduced in the config.defaults.env fie, but in a pinch it's fine.

# Launching Tangerine

All of the shell scripts for launching Tangerine are in the root directory. The two scripts `develop-docker-compose.sh` and `start-docker-compose.sh` start the cascade to build and run the docker containers. 

# Testing

## Create group

Create a group by running the following command. This creates a group called "CM-1" using the case-module.

```
docker exec server create-group "CM-1" case-module
```

## Author/Media Library

Test uploading files. If you get error "413 Request Entity Too Large" you may need to set `client_max_body_size` in nginx. For example here is a location property in nginx/default.conf:

```
    location ~ ^/app/([^/]+)/media-upload {
      client_max_body_size 5M;
      proxy_pass http://server/api/$1/media-upload;
    }
```

# Networking

We originally used the older docker network for Tangerine, relying upon the --link property to bridge shared containers. 
This implementation used the docker default 'bridge' network. This docker-compose version uses the default docker-compose `tangerine_default` network.

# Application startup

The containers `server` and `server-ui` launch using the entrypoint `npm start` from their respective directories. Each src/main.ts has a bootstrap function that starts a listener at port 80 (server-ui). The docker-compose.yml settings make server available to the internal network at port 82 and the server-ui at port 81. 

## Server-ui

The bootstrap function creates a NestExpressApplication using `src/app.module.ts`. AppModule launches the editor interface ([app.module.ts](..%2F..%2Fserver-ui%2Fsrc%2Fapp.module.ts)). It also launches an expressInstance that serves the routes in server-ui/src/express-app.js.

The instance of tangy-form-editor in server-ui's editor uses the tangy-form lib instead of linking to the tangy-form code in the tangerine filesystem (i.e. "tangy-form": "file:../tangy-form" in package.json). This is a compromise to deal with a duplicate lib issue. 

### Modifying the editor UI

If you need to develop the editor app and/or make changes to tangy-form-editor, docker exec into the server-ui container and launch dockerdev in editor: 

```
docker exec -it server-ui sh
## The first time you run this, you'll need to install the node_modules
cd /tangerine/tangy-form-editor
npm install
## End first time setup
cd /tangerine/editor
npm run dockerdev ### to watch the editor dirs.
```

### Modifying the client app

First get client to build automatically: 

docker exec -it apk-generator bash

```
cd /tangerine/client
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ -c production --output-path ./dev &
```

Since that command was run with an "&" at the end - instructing the shell to run the command as a background process -  you can run the next command in the same shell. 

*** Wait a moment to get the results of the first command. ***

```text
✔ Browser application bundle generation complete.
✔ Index html generation complete.
```

This will show if the compilation is successful.

## The first time you run this, you'll get an error and will need to install the node_modules
cd /tangerine/tangy-form
npm install
## End first time setup

Now run the following script to copy the built app whenever you want to generate an APK or PWA:

```
cd /tangerine/client && \
rm -rf builds/apk/www/shell && \
rm -rf builds/pwa/release-uuid/app && \
cp -r dev builds/apk/www/shell && \
cp -r pwa-tools/updater-app/build/default builds/pwa && \
cp -r dev builds/pwa/release-uuid/app
```

Now after you make changes, run the copy script and this will update the builds dir when you generate an apk or pwa.

## Server

The bootstrap function creates a NestExpressApplication using `src/app.module.ts`. AppModule launches the editor interface ([app.module.ts](..%2F..%2Fserver%2Fsrc%2Fapp.module.ts)). It also launches an expressInstance that serves the routes in server/src/express-app.js. Notice that these routes are mostly different from the routes in server-ui/src/express-app.js.

# Useful commands:

`docker-compose build` - builds the containers.

`./start-docker-compose.sh  2> /dev/null` - Starts the containers and filters out verbose logs from couchdb. Wait a few minutes for the logs to show the server-ui route mappings; then it is ready to use.

`./develop-docker-compose.sh  2> /dev/null` - Dev mode for the start script. If you open `develop-docker-compose.sh`, you'll see the `NPM_DEV_MODE=":dev"` switch, which launches server and server-ui in dev mode (watch files for changes).

`docker exec -it nginx sh` - shell to nginx (or substitute 'nginx' for server or server-ui to access those container shells). The base image is Alpine; Alpine ships with sh instead of bash.

`docker network ls` - list the network ip addresses. Sample output:

```shell
NETWORK ID     NAME                DRIVER    SCOPE
d87d99198043   bridge              bridge    local
9e661b525406   host                host      local
2cc29a7515a3   none                null      local
9957005bed14   tangerine_default   bridge    local
```

The following takes the network id from the tangerine_default network in docker network ls:

```shell
docker network inspect -f \
'{{json .Containers}}' 9957005bed14 | \
jq '.[] | .Name + ":" + .IPv4Address'
```

Output: 
```shell
"server-ui:172.18.0.5/16"
"server:172.18.0.3/16"
"nginx:172.18.0.2/16"
"couchdb:172.18.0.4/16"
```

## Nginx commands

`docker exec -it nginx nginx -s reload` - reload the nginx config (default.conf) after making changes

Add the following to the docker-compose image section to provide verbose debugging of nginx:
`command: [nginx-debug, '-g', 'daemon off;']`

## Migration issues

I have migrated most of the editor code that directly fetches app assets from the server to use the filesService, which uses a URL that nginx easily does a proxy_pass over to the server.
Unfortunately some of the code is inside the tangy-form lib and would require much more refactoring to use fileServer. 

Example get using filesService: `const appConfig = <AppConfig>await this.filesService.get(this.groupId, 'app-config.json')`
Example get using XMLHttpRequest (tangy-form's tangy-location input) `request.open('GET', this.locationSrc);`
 - this.locationSrc = './assets/location-list.json'
 - This creates the following urL: ' /app/group-0812e5b7-8d13-48f4-b274-f1ebff2f1df1/assets/location-list.json'
 - I had to add  the following mapping in the docker container for server-ui to access the data dir: 
```yaml
      - ./data/groups:/tangerine/groups/:delegated
```
 - In the server-ui express-app.js I added a route that points to the /tangerine/groups/ path inside the container. It uses this new mapping to ./groups...
```yaml
  app.use('/app/:group/assets/', function (req, res, next) {
    const params = JSON.stringify(req.params)
    console.log("server-ui route: /app/:group/assets : " + params + " req.url: " + req.url + " req.originalUrl: " + req.originalUrl)
    let contentPath = `/tangerine/groups/${req.params.group}/client`
    return express.static(contentPath).apply(this, arguments);
  });
 - ```
 - One thing to note: the main / routes to server-ui (editor): 
```yaml
    location / {
      proxy_pass http://server-ui;
    }
```
     We may consider having it route to server instead and have it hoist the editor. Also check out these express routes in server-ui (editor):
   ```js
      app.use('/', function (req, res, next) {
  app.use('/app/:group/', function (req, res, next) {...}
  app.use('/app/:group/assets/', function (req, res, next) {

```
    The last route - /app/:group/assets/ - is what is serving files from the groups directory on the /tangerine fs. 

Ideally, app.use('/',..) amd app.use('/app/:group/assets/') would be in server/express-app.js and only  app.use('/app/:group/') would be in server-ui/express-app.js.

## Troubleshoting

### Startup issues

If you get the following error when launching the start script:

```
 => CANCELED [apk-generator 41/49] RUN cd /tangerine/online-survey-app &&     ./node_modules/.bin/ng build -  78.2s
 => ERROR [server-ui 14/21] ADD editor /tangerine/editor                                                       0.1s
------
 > [server-ui 14/21] ADD editor /tangerine/editor:
------
failed to solve: cannot copy to non-directory: /var/lib/docker/overlay2/caqplhs7l3pi6pk4wqi1v1zhh/merged/tangerine/editor/package-lock.json
```

See if there is a package-lock.json in the editor directory that is a *directory* and not a file. If so, delete it and try again.


