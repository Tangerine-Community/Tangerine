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
app.post('/deprecated/upload/:group',
    function(req, res) {
        var data = '';
        req.on('data', function(chunk) {
            data += chunk;
        });
        req.on('end', function() {
            const group = req.params.group;
            const formData = data.substring(0, data.length - 2)
            const decompressed = LZString.decompressFromBase64(formData);
            const json = JSON.parse(decompressed);
            const url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_bulk_docs`
            unirest.post(url).headers(JSON_OPTS)
                .type('json')
                .send(json)
                .end(function(response){
                    res.status(response.status)
                        .json(response.body);
                });
        });
    }
);

var carefulUpload = function(group, uploadedDocs, callback) {
  const url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_bulk_docs`
  unirest.post(url)
  .headers(JSON_OPTS)
  .type('json')
  .send({docs: uploadedDocs})
  .end(function(response){
    callback(null, response)
  });
}

// This forces any of the docs in uploadedDocs to have the most recent revision number in the database as to ensure they are not rejected when uploaded. 
var forceUpload = function(group, uploadedDocs, callback) {
  const keys = []
  // Of the uploaded documents, docs in the database with the same keys.
  uploadedDocs.forEach(function(uploadedDoc) {
    keys.push(uploadedDoc._id)
  })
  var url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_all_docs?keys=${JSON.stringify(keys)}`
  unirest.get(url)
    .end(function(response){
      // Parse the response body.
      var body = JSON.parse(response.body)
      // _all_docs does not just return docs, it also returns gibberish you asked for but it didn't have. Clean this mess up by looking for only rows
      // that have an id. Note that this is one of the inconsistencies of CouchDB's API. The ID property is `id` here, not `_id`. 
      var docsInDb = []
      body.rows.forEach(function(row) {
        if (row.hasOwnProperty('id')) docsInDb.push(row)
      })
      // Look through the Docs we found in the database, when we find a match to what we have uploaded, replace the `_rev` in our
      // uploaded data with the `_rev` of the doc from the database so that we guarantee that when we submit the uploaded data to
      // CouchDB it will not be rejected.
      docsInDb.forEach(function(docInDb) {
        var i = 0
        var docPlaceInArray = null
        // Find a match.
        uploadedDocs.forEach(function(uploadedDoc) {
          if (docInDb.id == uploadedDoc._id) docPlaceInArray = i
          i++
        })
        // If docPlaceInArray is null, then it's a new doc and we don't have to worry about the revision in the database because there is none.
        if (docPlaceInArray !== null) uploadedDocs[docPlaceInArray]._rev = docInDb.value.rev   
      })
      // Now that we have uploaded data with the most recent revision numbers from the data, we can safely POST this data to the database.
      const url = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${group}/_bulk_docs`
      const json = JSON.stringify({'docs': uploadedDocs})
      unirest.post(url)
      .type('json')
      .send(json)
      .end(function(response){
        callback(null, response)
      });
  });
}

// accept a call to _bulk_docs
app.post('/upload/:group', function(req, res) {
  
  // Wait for request to end with all of data.
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {

    var group = req.params.group;
    var formData = data.substring(0, data.length - 2)
    var decompressedData = LZString.decompressFromBase64(data);
    //var decompressedData = LZString.decompressFromBase64(formData);
    var uploadedDocs = (JSON.parse(decompressedData)).docs 

    // Set the uploadDate on each doc.
    uploadedDocs.forEach(function(doc) {
      doc.uploadDate = Date.now()
    })

    if (req.query.hasOwnProperty('force') && req.query.force == "true") { 
      forceUpload(group, uploadedDocs, function(err, response) {
        if (err) console.log(err)
        res.status(response.status).json(response.body);
      })
    }
    else {
      carefulUpload(group, uploadedDocs, function(err, response) {
        if (err) console.log(err)
        res.status(response.status).json(response.body);
      })    
    }
  })

});


// kick it off
const server = app.listen(Settings.T_DECOMPRESSOR_PORT, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Decompressor: http://%s:%s', host, port);
});
