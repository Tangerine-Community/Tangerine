'use strict';

const Group = require('../../Group');
const User = require('../../User');
const Acl = require('../../Acl');
const Conf = require('../../Conf');
const logger = require('../../logger');
const HttpStatus = require('http-status-codes');
const unirest = require('unirest');

const errorHandler = require('../../utils/errorHandler');

// for mkdirp
const fse = require('fs-extra');

/** Creates a new group.
 * Makes new database, and uploader user.
 * replicates from trunk
 * creates a result database
 * monitor changes in the database
 * alters settings doc
 */

function newGroup(req, res) {

  logger.info(`New group: ${JSON.stringify(req.body)}`);

  const notEvenLoggedIn = req.couchAuth.body.userCtx.name === null;
  if (notEvenLoggedIn) {
    logger.warn('Group creation failed: User not logged in');
    return res.status(HttpStatus.UNAUTHORIZED).json({ message : 'Please log in' });
  }

  Acl('Create new group', req.couchAuth.body.userCtx, function(err, hasPermission) {

    if (err) {
      logger.warn('Group creation failed: Internal error.');
      logger.warn(err)
      return res.status(HttpStatus.UNAUTHORIZED)
        .json({ message : 'There was an error. Try again later.' });
    }

    if (hasPermission == false) {
      logger.warn('Group creation failed: Insufficient permission.');
      return res.status(HttpStatus.UNAUTHORIZED).json({ message : 'Insufficient permission' });
    }

    const groupName = req.body.name;

    if (groupName === undefined) {
      logger.warn('Group creation failed: No name provided.');
      logger.warn(req.body)
      return res.status(HttpStatus.UNAUTHORIZED)
        .json({ message : 'Group creation failed: No name provided'});
    }

    const nameFromCookie = req.couchAuth.body.userCtx.name;
    const requestingUser = new User({ name : nameFromCookie });
    const group = new Group({ name : groupName });

    logger.info(`New group '${group.name()}' request by '${requestingUser.name()}'`)

    group.create()
      .then(function addAdmin() {
        return requestingUser.grantAdmin(group);
      })
      .then(function respondOk() {
        const message = `New group '${groupName}' created`;
        logger.info(message);
        res.status(HttpStatus.CREATED).json({ message : message });
      })
      .then(function monitorChanges() {
        const groupDbNameUrl = Conf.calcGroupUrl(groupName);
        const groupResultsDbUrl = Conf.calcGroupUrl(`${groupName}-result`);
        let changeOption = { startPoint: 'now', isLive: true, baseDb: groupDbNameUrl, resultDb: groupResultsDbUrl };
        unirest.post('http://localhost:5555/tangerine_changes',JSON_OPTS, changeOption)
          .end(function(response) { logger.info('Response is done '); });
      })
      .then(function setupMediaAssetsDir(){
        fse.ensureDir('/tangerine-server/client/media_assets/'+groupName, function(err) {
          // dir has now been created, including the directory it is to be placed in
          if (err) return console.error(err);
        })
      })
      .catch(errorHandler(res));

  })

}

module.exports = newGroup;
