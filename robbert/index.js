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

const Conf = require('./Conf');
const Settings = require('./Settings');
const User = require('./User');
const Group = require('./Group');

const app = express();

app.use(bodyParser.json()); // use json
app.use(cookieParser());    // use cookies
app.use(couchAuth);         // use couchdb cookie authentication
app.use(requestLogger);     // add some logging
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

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
app.get('/', function(req, res){ res.status(HttpStatus.OK).send(`<body><canvas id='big-img' width='200' height='200' style='width:404px;height:404px;margin:auto;top:0;left:0;right:0;bottom:0;position:absolute;'></canvas></body><script>var img;(img = new Image()).src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAECAYAAABGM/VAAAAAP0lEQVQIW2NkYGBgyMvL+w+iQWDSpEmMjBUVFf+fPXvGICUlBRb89u0bA1gwbv9+hhnm5gwZJ0+CaUZkrTAjABn8FuBBBHgOAAAAAElFTkSuQmCC';var big = document.getElementById('big-img').getContext('2d');big.imageSmoothingEnabled = false;big.drawImage(img,0,0,8,8,0,0,200,200);</script>`); });

// kick it off
var server = app.listen(Settings.T_ROBBERT_PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Robbert: http://%s:%s', host, port);
});

// Update all group databases with most recent code from the tangerine database.
var couchUrl = 'http://' + process.env.T_NEW_ADMIN + ':' + process.env.T_NEW_ADMIN_PASS + '@127.0.0.1:5984/'
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
      "doc_ids": ["_design/ojai"]
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
