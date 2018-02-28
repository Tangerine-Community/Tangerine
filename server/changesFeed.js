const logger = require('./logger');
// const Group = require('./Group')
let Conf = require('./Conf');
var nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
const dbConfig = require('./reporting/config');
const PouchDB = require('pouchdb');

let changesFeed = function (groupName) {
  logger.info("Changes feed for: " + groupName)
  nano.db.list(function(err, databases) {
    if (err) return callback(err)
    var groupNames = []
    databases.forEach(function(databaseName) {
      if (databaseName.search('group-') !== -1) {
        if (databaseName.search('-result') === -1) {
          groupNames.push(databaseName)
        }
      }
    })
    logger.info("groupNames:" + groupNames)
    const processChangedDocument = require('./reporting/controllers/changes').processChangedDocument;
    groupNames.forEach(function(groupName) {
      const baseDb = dbConfig.base_db + groupName
      const resultDb = dbConfig.base_db + groupName + '-result'
      const GROUP_DB = new PouchDB(baseDb);
      const RESULT_DB = new PouchDB(resultDb);
      console.log("baseDb: " + baseDb + " resultDb: " + resultDb)
      GROUP_DB.changes({ since: 'now', include_docs: true, live: true })
        .on('change', (body) => processChangedDocument(body))
        .on('error', (err) => console.error(err));
    })

  })
}
module.exports = changesFeed;