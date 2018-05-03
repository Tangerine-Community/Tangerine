'use strict';

const logger = require('./logger');
const Conf = require('./Conf');
const Group = require('./Group');
const nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
const Settings = require('./Settings');
const unirest = require('unirest');

const DB_URL = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}/db/`;
const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};

// Constants for replicating database
const SOURCE_DB = 'tangerine';
const GROUP_DOC_IDS = ['_design/ojai', '_design/dashReporting', 'configuration', 'settings', 'templates', 'location-list'];
const RESULT_DOC_IDS = ['_design/ojai', '_design/dashReporting'];

const notifyReportingServer = function () {
  logger.info('::: Running changes feed :::');

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

    logger.info('GroupNames: ' + groupNames, '\n GroupResult Names: ' + groupResultNames);

    groupNames.forEach(function(groupName) {
      let groupExists = groupResultNames.find(function(groupResult) {
        return groupResult === `${groupName}-result`;
      });
      const baseDb = DB_URL + groupName;
      const resultDb = DB_URL + groupName + '-result';

      if (!groupExists) {
        const newGroupName = `${groupName}-result`;
        const group = new Group({ name: newGroupName });

        group.createResult(newGroupName)
          .then(function replicateDatabase() {
            logger.info(`New group '${newGroupName}' created`);
            logger.info(`Running replication for ${newGroupName} database`);
            setTimeout(function() {
              return group.replicate(SOURCE_DB, newGroupName, RESULT_DOC_IDS);
            }, 3000);
          })
          .then(function addRoles() {
            return group.addGroupRoles(newGroupName);
          })
          .catch(function(err) {
            console.error(err);
          });
      }

      let changeOption = { startPoint: 'now', isLive: true, baseDb: baseDb, resultDb: resultDb };
      unirest.post('http://localhost:5555/tangerine_changes', JSON_OPTS, changeOption)
        .end(function(response) { logger.info('Response is done'); });

    });

  });

}

module.exports = notifyReportingServer;
