'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** Removes an admin from a group. */
const removeAdmin = function (req, res) {

  // variables from url, cookies, and body
  const nameFromCookie = req.couchAuth.body.userCtx.name;
  const targetUsername = req.body.user;
  const groupName      = req.params.group;

  // associated models
  const requestingUser = new User({
    name : nameFromCookie
  });
  const targetUser = new User({
    name : targetUsername
  });
  const group = new Group({
    name : groupName
  });

  // get to work
  group.assertExistence()
    .then(function assertTargetUser(){
      return targetUser.assertExistence();
    })
    .then(verifyRequester(req, requestingUser, group, targetUser))
    .then(function removeAdmin() {
      return targetUser.revokeAdmin(group);
    })
    .then(function respondSuccess(){
      const message = `Removed admin '${targetUsername}' from group.`;
      logger.info(message);
      res.status(HttpStatus.OK)
        .json({
          message : message
        });
    })
    .catch(errorHandler(res));

};

module.exports = removeAdmin;