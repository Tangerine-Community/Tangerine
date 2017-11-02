'use strict';

const unirest = require('unirest');
const express = require('express');
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

// Enforce SSL behind Load Balancers.
if (process.env.T_PROTOCOL == 'https') {
  app.use(function (req, res, next) {
    if (req.get('X-Forwarded-Proto') == 'http') {
      res.redirect('https://' + req.get('Host') + req.url);
    }
    else {
      next();
    }
  });
}

var couchProxy = proxy('localhost:5984', {
  forwardPath: function (req, res) {
    var path = require('url').parse(req.url).path;
    console.log("path:" + path);
    return path;
  }
});

var mountpoint = '/db';
app.use(mountpoint, couchProxy);

app.use(mountpoint, function (req, res) {
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
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/app/:group', express.static(__dirname + '/../editor/src/'));
app.use('/client', express.static(__dirname + '/../client/build/'));

// User routes
app.get('/user/:name', require('./routes/user/get-user'));
app.put('/user', require('./routes/user/new-user'));
app.delete('/user/:name', require('./routes/user/delete-user'));

// Group routes
app.get('/group/:group', require('./routes/group/get-group'));
app.put('/group', require('./routes/group/new-group'));
app.delete('/group/:group', require('./routes/group/delete-group'));

// mutate groups/users
app.post('/group/:group/add-admin', require('./routes/group/add-admin'));
app.post('/group/:group/remove-admin', require('./routes/group/remove-admin'));
app.post('/group/:group/add-member', require('./routes/group/add-member'));
app.post('/group/:group/remove-member', require('./routes/group/remove-member'));

app.delete('/group/:group/:user', require('./routes/group/leave-group'));


// landing
app.get('/', function (req, res) {
  res.redirect('/client-v3/en/index.html')
})

// kick it off
var server = app.listen(Settings.T_ROBBERT_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Robbert: http://%s:%s', host, port);
});

