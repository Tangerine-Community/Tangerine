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


// Set up the app server.
// Claim a route for the database at `/api/db`. We may have other APIs under `/api/*` in the future.
app.use('/api/db', require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));
// Use the compiled Angular app in dist at the root of the server.
app.use(express.static(path.join(__dirname, '../dist')));
// Claim port 80 for the app.
app.listen(80);

// Set up PouchDB Server.
// Claim a second port so we can use Fauxton DB Admin at the root level, otherwise it chokes.
fauxton.use(require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));
fauxton.listen(5984);

async function setup() {
  
  // Set up the admin user.
  try {
    await http.put(`${DB_URL}/_config/admins/${config.admin.username}`, `"${config.admin.password}"`, {headers:{}});
    console.log("Admin created.");
  }
  catch (err) {
    console.log("We already have admins."); 
  }

  // Set up databases.
  config.databases.forEach(async (database) => {
    try {
      await http.put(`${DB_ADMIN_URL}/${database}`);
      console.log(`${database} database created.`);
    }
    catch (err) {
      console.log(`We have a ${database} database.`); 
    }
  })
  
}
setup();
