
const PouchDB = require('pouchdb')
var pouchDbDefaults = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  pouchDbDefaults = { prefix: process.env.T_COUCHDB_ENDPOINT }
} else {
  pouchDbDefaults = { prefix: '/tangerine/db/' }
}
module.exports = PouchDB.defaults(pouchDbDefaults)
