var http = require('axios');
var read = require('read-yaml');
var PouchDB = require('pouchdb');
var express = require('express');
var path = require('path');
var app = express();
var fauxton = express();
var config = read.sync('./config.yml');

const DB_URL = `${config.protocol}${config.domain}:${config.port}${config.dbServerEndpoint}`
const DB_ADMIN_URL = `${config.protocol}${config.admin.username}:${config.admin.password}@${config.domain}:${config.port}${config.dbServerEndpoint}`

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
  app.use('/tangy-forms', express.static(path.join(__dirname, '../client/build/tangy-forms')));
  // App updater at /*
  app.use('/', express.static(path.join(__dirname, '../client/app-updater')));
} else {
  app.use('/', express.static(path.join(__dirname, '../client/build')));
}


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
