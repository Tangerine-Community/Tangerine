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

const changesFeed = require('./changesFeed');
const dbQuery = require('./reporting/utils/dbQuery');

/**
* Reporting Controllers.
*/

const assessmentController = require('./reporting/controllers/assessment');
const resultController = require('./reporting/controllers/result');
const workflowController = require('./reporting/controllers/workflow');
const csvController = require('./reporting/controllers/generate_csv');
const changesController = require('./reporting/controllers/changes');
const tripController = require('./reporting/controllers/trip');

const app = express();

console.log("Hook data processing function to changes feed.");
changesFeed();

// Enforce SSL behind Load Balancers.
if (process.env.T_PROTOCOL == 'https') {
  app.use(function(req, res, next) {
    if(req.get('X-Forwarded-Proto') == 'http') {
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

app.get('/usage', require('./routes/usage'));
app.get('/usage/:startdate', require('./routes/usage'));
app.get('/usage/:startdate/:enddate', require('./routes/usage'));

app.get('/groups', require('./routes/groups'));
app.get('/groups/:startdate', require('./routes/groups'));
app.get('/groups/:startdate/:enddate', require('./routes/groups'));

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

// retrieve stored photo
app.get('/media/resultphoto/:group/:result/:subtest', require('./routes/media/get-result-photo'))

/**
 * Reporting App routes
 */

app.post('/assessment', assessmentController.all);
app.post('/assessment/headers/:id', assessmentController.generateHeader);

app.post('/result', resultController.all);
app.post('/assessment/result/:id', resultController.processResult);

app.post('/workflow', workflowController.all);
app.post('/workflow/headers/:id', workflowController.generateHeader);
app.post('/workflow/result/:id', tripController.processResult);

app.post('/generate_csv/:id', csvController.generate);
app.post('/tangerine_changes', changesController.changes);
app.post('/get_processed_results/:id', dbQuery.processedResultsById);

// landing
app.get('/', function(req, res){
  res.redirect('/app/tangerine/index.html')
})

// kick it off
var server = app.listen(Settings.T_ROBBERT_PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Robbert: http://%s:%s', host, port);
});

