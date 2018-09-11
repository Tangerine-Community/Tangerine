
const PouchDB = require('pouchdb')
const dbDefaults = require('./db-defaults.js')
module.exports = PouchDB.defaults(dbDefaults, {timeout: 50000})
