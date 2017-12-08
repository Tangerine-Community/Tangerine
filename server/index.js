var http = require('axios');
var read = require('read-yaml');
var PouchDB = require('pouchdb');
var express = require('express');
var path = require('path');
var app = express();
var fauxton = express();
var fs = require('fs-extra');
var config = read.sync('./config.yml');

const DB_URL = `${config.protocol}${config.domain}:${config.port}${config.dbServerEndpoint}`
const DB_ADMIN_URL = `${config.protocol}${config.admin.username}:${config.admin.password}@${config.domain}:${config.port}${config.dbServerEndpoint}`

const contentRoot = '../client/content';

// Database at /db/*
app.use(config.dbServerEndpoint, require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));

// Content at /content/*
app.use('/content', express.static(path.join(__dirname, '../client/build/content')));

// If we are in DEBUG mode, then glue together various dev folders into a structure that reperesents the paths of what they would be built else 
// mount the client build folder and don't worry about it.
if (process.env.DEBUG) {
  // Shell at /tangerine/*
  app.use('/tangerine', express.static(path.join(__dirname, '../client/shell/dist')));
  // Tangy Forms at /tangy-forms/*
  app.use('/tangy-forms', express.static(path.join(__dirname, '../client/tangy-forms')));
  // App updater at /*
  app.use('/', express.static(path.join(__dirname, '../client/app-updater')));
} else {
  app.use('/', express.static(path.join(__dirname, '../client/build')));
}

// editor


// kudos: https://stackoverflow.com/questions/45293969/waiting-for-many-async-functions-execution
let readFiles = ()=>{
  var dir = contentRoot;
  // const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory())
  const isDirectory = source => fs.lstatSync(source).isDirectory()
  const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
  let dirList = getDirectories(dir);
  let contents = {};
  let promises = dirList
    .map(path => fs.readJson(path + '/metadata.json').catch(err => {
        console.error(err) // Not called
      })
    );
  return Promise.all(promises);
}

function listProjects() {
  return new Promise((resolve, reject) => {
    console.log("listing projects.")
    readFiles()
      .then(contents => {
        // contents = contents.filter(function(n){ console.log("n is: " + JSON.stringify(n) + " type: " + typeof n);return typeof n == 'object' });
        contents = contents.filter(function(n){ return typeof n == 'object' });
        console.log("contents : " + JSON.stringify(contents))
        resolve(contents)
        return contents
      })
      .catch(error => {
        console.log("bummer: " + error)
        reject(contents)
      });
  });
}

app.get('/project/listAll', function (req, res, next) {

  var dirs = listProjects().then(function(result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function(err) {
    console.log(err); // Error: "It broke"
  });
  // return next();
});


// Bind the app to port 80.
app.listen(config.port);

// Setup fauxton on port 5984 at root path because it will only work there due to some hardcoded expectations in the Fauxton JS.
fauxton.use(require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));
fauxton.listen(5984);

// Setup database.
async function setup() {

  // Set up the admin user.
  try {
    await http.put(`${DB_URL}/_config/admins/${config.admin.username}`, `"${config.admin.password}"`, {headers:{}});
    console.log("Admin created.");
  }
  catch (err) {
    console.log("We already have admins."); 
  }

  // Set up the app database.
  try {
    await http.put(`${DB_ADMIN_URL}/tangerine`);
    console.log("Todos database created.");
  }
  catch (err) {
    console.log("We already have an app database."); 
  }

}
setup();

