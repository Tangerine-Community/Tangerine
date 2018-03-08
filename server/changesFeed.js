const logger = require('./logger');
const Conf = require('./Conf');
const nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
const PouchDB = require('pouchdb');

const dbConfig = require('./reporting/config');
const processChangedDocument = require('./reporting/controllers/changes').processChangedDocument;

let changesFeed = function (groupDB, groupResultDB) {
  logger.info('Running changes feed');
  if (groupDB && groupResultDB) {
    monitorChange(groupDB, groupResultDB);
  } else {
    nano.db.list(function(err, databases) {
      if (err) return callback(err);
      let groupNames = [];
      databases.forEach(function(databaseName) {
        if (databaseName.search('group-') !== -1) {
          if (databaseName.search('-result') === -1) {
            groupNames.push(databaseName);
          }
        }
      });
      logger.info('groupNames: ' + groupNames);
      groupNames.forEach(function(groupName) {
        const baseDb = dbConfig.db_url + groupName;
        const resultDb = dbConfig.db_url + groupName + '-result';
        monitorChange(baseDb, resultDb);
      });
    });
  }
}

function monitorChange(baseDb, resultDb) {
  const GROUP_DB = new PouchDB(baseDb);
  GROUP_DB.changes({ since: 'now', include_docs: true, live: true })
    .on('change', body => processChangedDocument(body, baseDb, resultDb))
    .on('error', err => console.error(err));
}

module.exports = changesFeed;
