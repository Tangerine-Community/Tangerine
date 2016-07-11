'use strict';

const unirest    = require('unirest');
const express    = require('express');
const HttpStatus = require('http-status-codes');

// for json parsing in recieved requests
const bodyParser = require('body-parser');

// for cookie parsing in recieved requests
const cookieParser = require('cookie-parser');

// for cookie authorization
const couchAuth = require('./middlewares/couchAuth');

// basic logging
const requestLogger = require('./middlewares/requestLogger');

// proxy for couchdb
var proxy = require('express-http-proxy');

const Conf = require('./Conf');
const Settings = require('./Settings');
const User = require('./User');
const Group = require('./Group');

const app = express();

var couchProxy = proxy('localhost:5984', {
  forwardPath: function (req, res) {
    var path = require('url').parse(req.url).path;
    console.log("path:" + path);
    return path;
  }
});

var mountpoint = '/db';
app.use(mountpoint, couchProxy);

app.use(mountpoint, function(req, res) {
  if (req.originalUrl === mountpoint) {
    res.redirect(301, req.originalUrl + '/');
  } else {
    couchProxy;
  }
});

app.use(bodyParser.json()); // use json
app.use(cookieParser());    // use cookies
app.use(couchAuth);         // use couchdb cookie authentication
app.use(requestLogger);     // add some logging
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/app/:group', express.static(__dirname + '/../editor/src/'));
app.use('/client', express.static(__dirname + '/../client/src/'));

// User routes
app.get('/user/:name',    require('./routes/user/get-user'));
app.put('/user',          require('./routes/user/new-user'));
app.delete('/user/:name', require('./routes/user/delete-user'));

// Group routes
app.get('/group/:group',    require('./routes/group/get-group'));
app.put('/group',           require('./routes/group/new-group'));
app.delete('/group/:group', require('./routes/group/delete-group'));

// mutate groups/users
app.post('/group/:group/add-admin',     require('./routes/group/add-admin'));
app.post('/group/:group/remove-admin',  require('./routes/group/remove-admin'));
app.post('/group/:group/add-member',    require('./routes/group/add-member'));
app.post('/group/:group/remove-member', require('./routes/group/remove-member'));

app.delete('/group/:group/:user', require('./routes/group/leave-group'));


// landing
app.get('/', function(req, res){
  res.redirect('/app/tangerine/index.html')
})

// CSV output for results. Returns cached response if there are the same number of results.
app.get('/_csv/:groupId/:assessmentId',  function (req, res)  { 
  couchdb(req.groupId).view('results', {key: req.assessmentId}, function(results){
    var cached = cache.get(`${req.groupId}-${req.assessmentId}-${results.total_rows}`)
    if (cached !== undefined) {
      res.send(cached)
    }
    else {
      couchdb(req.groupId).view('results', {key: req.assessmentId, include_docs: true}, function(results){
        var response = json2csv(results.docs)
        res.send(response)
        cache.get(`${req.groupId}-${req.assessmentId}-${results.total_rows}`, response)
      })
    }
  })
})

// kick it off
var server = app.listen(Settings.T_ROBBERT_PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Robbert: http://%s:%s', host, port);
});

// Update all group databases with most recent code from the tangerine database.
var couchUrl = 'http://' + process.env.T_ADMIN + ':' + process.env.T_PASS + '@127.0.0.1:5984/'
var databases = []
var groupDatabases = []
unirest.get(couchUrl + '_all_dbs').send().end(function(response) { 
  databases = JSON.parse(response.body)
  databases.forEach(function(database) {
    if (database.substr(0,6) == 'group-') {
      groupDatabases.push(database)
    }
  })
  groupDatabases.forEach(function(database) {
    var packet = {
      "source": couchUrl + "tangerine",
      "target": couchUrl + database,
      "doc_ids": ["_design/ojai", "configuration"]
    }
    unirest.post(couchUrl + '_replicate')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(packet)
    .end(function(response) {
      if (response.body.ok === true) {
        console.log('Updated app in ' + database)
      }
      else {
        console.log(response.body)
        process.exit(1)
      }
    })
  })
}) 
