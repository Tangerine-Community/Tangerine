'use strict';

const Settings = require('./Settings');
const express = require('express');

const Conf = require('./Conf');

require('shelljs/global');

// for cookie parsing in recieved requests
const cookieParser = require('cookie-parser');

// for parsing request bodies
const bodyParser = require('body-parser');

// for standard http responses
const HttpStatus = require('http-status-codes');

const app = express();

// parse requests with json bodies
app.use(bodyParser.urlencoded());

// use cookies
app.use(cookieParser());

// always authenticate with couch first
app.use(require('./middlewares/couchAuth'));


// pixel art proof of life
app.get('/', function(req, res){ res.status(HttpStatus.OK).send(`<body><canvas id='big-img' width='200' height='200' style='width:200px;height:200px;margin:auto;top:0;left:0;right:0;bottom:0;position:absolute;'></canvas></body><script>var img;(img = new Image()).src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAl0lEQVQYV2NkgIKa1eX/n2jfZ1igtYoRJgaiwZzoM17/j645x2AdYsQAokEgxjieoSW0k5ERpvPN3ScMV47eQ9bM8KDjBSOjQoXEf5DOj88/wBW8P/yBQdBWAKwYbMKSswvBHJBE9h8BhmWOEPbHoz8YwW6AKYraz8DQdvIFWOz/////GUEA2dIqc4n/MAUwcQwFIAlkRQD1U0m4Go1m7gAAAABJRU5ErkJggg==';var big = document.getElementById('big-img').getContext('2d');big.imageSmoothingEnabled = false;big.drawImage(img,0,0,8,8,0,0,200,200);</script>`); });

// make an apk
// app.post('/:group', require('./routes/getAssessments'));
app.get('/:group', function(req, res) {

  let assessments = require('./routes/getAssessments')
  return assessments(req, res);
}
);
// app.get('/:group', function(req, res, next) { res.json({"foo": "bar"})});


// cd(Conf.APP_ROOT_PATH);
// const mkdirResult = mkdir('-p', `apks`);

// kick it off
const server = app.listen(Settings.T_PACKAGER_PORT, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Packager: http://%s:%s', host, port);
});
