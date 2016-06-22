'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** Creates a backup, deletes the DB and removes all references to a group. */
const deleteGroup = function(req, res){

  const nameFromCookie = req.couchAuth.body.userCtx.name;
  const groupName  = req.params.group;

  const group = new Group({
    name : groupName
  });
  const requestingUser = new User({
    name : nameFromCookie
  });

  logger.info(`Delete group '${group.name()}' by ${requestingUser.name()}`);

  verifyRequester(req, requestingUser, group)
    .then(function destroyGroup(){
      return group.destroy();
    })
    .then(function respondSuccess(){
      const message = `Group '${group.name()}' deleted.`;
      logger.info(message);
      res.status(HttpStatus.OK)
        .json({
          message : message
        });
    })
    .catch(errorHandler(res));
};

module.exports = deleteGroup;