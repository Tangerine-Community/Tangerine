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

Add the folloiwng to your node process:

```
--inspect=[::]:9229 index.js
```

for example, reporting/shart.sh:

nodemon --inspect=[::]:9229 index.js

using the leh* db for testing workflow csv generation

http://localhost/app/group-leh_wi_lan_pilot_2018/index.html#assessments


