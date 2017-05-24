
var http = require('http')
var express = require('express');
var csv = require('./csv.js')

var app = express();
app.set('port', 81);
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(methodOverride());

app.get('/csv/:workflowId/:year/:month', async function(req, res) {
  csv.get(req.params)
  //res.send(filename) 
})

http.createServer(app).listen(app.get('port'));
