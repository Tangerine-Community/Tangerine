# Using docker-compose to launch Tangerine

The docker-compose.yml file builds and launches several containers:
- server-ui - a NEST.js app that serves the editor interface. 
  - Available at port 81 inside the tangerine_default network.
  - /Dockerfile-server-ui
- server - backend support for the editor user interface. 
  - Available at port 82 inside the tangerine_default network
  - /Dockerfile-server
- nginx - reverse proxy that services requests for server and server-ui at port 80. Config files at nginx/default.conf
- couchdb - database server for server
  - Data persisted at ./data/couchdb/data

TODO: APK container.

# Configuration

Copy config.defaults.env to config.env and change T_HOST_NAME.

# Testing

At the moment you may login (user1/password - configurable in config.env) and browse groups - if you already have them. Group creation is probably not functioning at this point; same for Form editing. 

# Networking

We originally used the older docker network for Tangerine, relying upon the --link property to bridge shared containers. 
This implementation used the docker default 'bridge' network. This docker-compose version uses the default docker-compose `tangerine_default` network.

# Application startup

The containers `server` and `server-ui` launch using the entrypoint `npm start` from their respective directories. Each src/main.ts has a bootstrap function that starts a listener at port 80 (server-ui). The docker-compose.yml settings make server available to the internal network at port 82 and the server-ui at port 81. 

## Server-ui

The bootstrap function creates a NestExpressApplication using `src/app.module.ts`. AppModule launches the editor interface ([app.module.ts](..%2F..%2Fserver-ui%2Fsrc%2Fapp.module.ts)). It also launches an expressInstance that serves the routes in server-ui/src/express-app.js.

If you need to develop the editor app, docker exec into server-ui, cd to editor, and npm run dockerdev to watch the editor dirs.

## Server

The bootstrap function creates a NestExpressApplication using `src/app.module.ts`. AppModule launches the editor interface ([app.module.ts](..%2F..%2Fserver%2Fsrc%2Fapp.module.ts)). It also launches an expressInstance that serves the routes in server/src/express-app.js. Notice that these routes are mostly different from the routes in server-ui/src/express-app.js.

# Useful commands:

`docker-compose build` - builds the containers.

`docker-compose up 2> /dev/null` - Starts the containers and filters out verbose logs from couchdb. Wait a few minutes for the logs to show the server-ui route mappings; then it is ready to use.

To launch server and server-ui in dev mode (watch files for changes), prepend `NPM_DEV_MODE=":dev"` to docker-compose up command:

`NPM_DEV_MODE=":dev" docker-compose up 2> /dev/null`

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

`docker exec -it nginx nginx -s reload` - reload the nginx config (default.conf) after making changes

