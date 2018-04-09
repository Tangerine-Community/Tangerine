const logger = require('./logger');
const Conf = require('./Conf');
const Group = require('./Group');
const nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
const PouchDB = require('pouchdb');

const dbConfig = require('./reporting/config');
const processChangedDocument = require('./reporting/controllers/changes').processChangedDocument;

// Constants for replicating database
const SOURCE_DB = 'tangerine';
const GROUP_DOC_IDS = ['_design/ojai', '_design/dashReporting', 'configuration', 'settings', 'templates', 'location-list'];
const RESULT_DOC_IDS = ['_design/ojai', '_design/dashReporting'];

let changesFeed = function (groupDB, groupResultDB) {

  logger.info(' ::: Running changes feed ::: ');

  if (groupDB && groupResultDB) {
    monitorChange(groupDB, groupResultDB);
  } else {
    nano.db.list(function(err, databases) {
      if (err) return callback(err);
      let groupNames = [];
      let groupResultNames = [];

      databases.forEach(function(databaseName) {
        if (databaseName.search('group-') !== -1) {
          let isGroupResult = databaseName.search('-result') !== -1;
          if (!isGroupResult) {
            groupNames.push(databaseName);
          }
          if (isGroupResult) {
            groupResultNames.push(databaseName);
          }
        }
      });

      logger.info('Group Names: ' + groupNames, '\n GroupResult Names: ' + groupResultNames);

      groupNames.forEach(function(groupName) {
        let groupExists = groupResultNames.find((groupResult) => groupResult === `${groupName}-result`);
        const baseDb = dbConfig.db_url + groupName;
        const resultDb = dbConfig.db_url + groupName + '-result';

        if (!groupExists) {
          const newGroupName = `${groupName}-result`;
          const group = new Group({ name: newGroupName });

          group.createResult(newGroupName)
            .then(function responseMessage() {
              logger.info(`New group '${newGroupName}' created`);
            })
            .then(function replicateDatabase() {
              logger.info(`Running replication for ${newGroupName} database`);
              setTimeout(() => group.replicate(SOURCE_DB, newGroupName, RESULT_DOC_IDS), 3000);
            })
            .then(function addRoles() {
              return group.addGroupRoles(newGroupName);
            })
            .catch((err) => console.error(err));
        }

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
