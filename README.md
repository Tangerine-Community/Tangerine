robbert
=======

Tangerine's security robot, Robbert, helps enforce database-level security. robbert is responsible for the odds and ends of security that are otherwise difficult or impossible to attain with a simple couchapp.

Installation
============

Daemonize it:
```
docker run -d --name couchdb klaemo/couchdb
docker run -d --env-file ./env.list couchdb:couchdb rjsteinert/tangerine-robbert
```

Play around in the container:
```
docker run -it --entrypoint=/bin/bash --env-file ./env.list rjsteinert/tangerine-robbert
```

Requirements
============
- docker


Configuration
=============

Copy env.list.default to env.list, edit as needed.


Usage
=====

robbert has a simple api that uses `POST` requests.

### varaibles

   action
   group
   user

