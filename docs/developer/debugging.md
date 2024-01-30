# Debugging in the browser:

db.factor import the pouchdb-debug plugin. If you wish to see all Pouchdb debug logs, enter the following into the js console:

```js
PouchDB.debug.enable('*');
```

See the docs for examples of how to debug more specific debug outputs (like pouchdb:api or pouchdb:http) : https://www.npmjs.com/package/pouchdb-debug

# Debugging node apps
In develop.sh, the port 9229 should be opend.

```
docker run \
  -d \
  --name tangerine-container \
  -p 80:80 -p 5984:5984 -p 9229:9229 \
  --env "DEBUG=1" \
  --env "NODE_ENV=development" \
  etc...
```

Add the following to your node process:

```
--inspect=[::]:9229 index.js
```

for example, reporting/shart.sh:

nodemon --inspect=[::]:9229 index.js

using the leh* db for testing workflow csv generation

http://localhost/app/group-leh_wi_lan_pilot_2018/index.html#assessments


