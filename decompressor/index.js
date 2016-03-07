'use strict';

const Settings = require('./Settings');
const Conf = require('./Conf');

const unirest = require('unirest');

const express = require('express');

// cors middleware for express
const cors = require('cors');

const bodyParser = require('body-parser');

// for cookie parsing in recieved requests
const cookieParser = require('cookie-parser');

// for standard http responses
const HttpStatus = require('http-status-codes');

// for decompressing incoming data
const LZString = require("lz-string");

const app = express();

// turn on cors
app.use(cors());

// use cookies
app.use(cookieParser());

// always authenticate with couch first
// app.use(require('./middlewares/couchAuth'));

// standard json opts for unirest
const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};


// pixel art proof of life
app.get('/', function(req, res){ res.status(HttpStatus.OK).send(`<body><canvas id='big-img' width='200' height='200' style='width:200px;height:200px;margin:auto;top:0;left:0;right:0;bottom:0;position:absolute;'></canvas></body><script>var img;(img = new Image()).src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAZElEQVQYV2NkQAJz5sz5D+OmpKQwwthgBkwSWQJZjBHEQZZENhlmAFgRNiuQxcGKLL3iwOqOb1sENyguIgHMXrRiAQOKIphCmALSFCH7DmQtyEqQSSBrQADkKXhYICuGScIcCADEOEIp/83TCgAAAABJRU5ErkJggg==';var big = document.getElementById('big-img').getContext('2d');big.imageSmoothingEnabled = false;big.drawImage(img,0,0,10,10,0,0,200,200);</script>`); });

// accept a post to _all_docs
app.post('/check/:group', bodyParser.json(), function(req, res) {
    const group = req.params.group;
    const keys = req.body.keys;
    const url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_all_docs`

    unirest.post(url).headers(JSON_OPTS)
      .json({
        keys : keys
      })
      .end(function(response){
        res.status(response.status)
          .json(response.body);
      });
  }
);

// accept a call to _bulk_docs
app.post('/upload/:group',
  bodyParser.text({
    limit: 20e6 // 20MB
  }),
  function(req, res) {

    const group = req.params.group;

    const compressedData = req.body;
    const decompressed = LZString.decompressFromBase64(compressedData);

    const url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_bulk_docs`

    unirest.post(url).headers(JSON_OPTS)
      .type('json')
      .send(decompressed)
      .end(function(response){
        res.status(response.status)
          .json(response.body);
      });

  }
);

// kick it off
const server = app.listen(Settings.T_DECOMPRESSOR_PORT, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Decompressor: http://%s:%s', host, port);
});
