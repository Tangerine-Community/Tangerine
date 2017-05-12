robbert
=======

Tangerine's security robot, Robbert, helps enforce database-level security. robbert is responsible for the odds and ends of security that are otherwise difficult or impossible to attain with a simple couchapp.

Installation
============

Simply clone and point your http server to the directory.

Requirements
============

Nodejs and Couchdb

Configuration
=============

Normally you would let Docker configure this for you; however, if you are doing development on editor, you may wish to bootstrap this independently. 

Add the following to index.js:

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers", "Content-Type, *");
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});


Add the environment variables describe in ../editor/README.md. 

Set the port for Robbert:
```
export T_ROBBERT_PORT=4444
```

Install the dependencies
````
npm install
npm install nano

````

Run the app:

````
node index.js
````


Usage
=====

robbert has a simple api that uses `POST` requests.

### varaibles

   action
   group
   user

