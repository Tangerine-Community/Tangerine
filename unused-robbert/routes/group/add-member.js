'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** Adds a member user to a group */
const addMember = function(req, res) {

  // variables from url, cookies, and body
  const nameFromCookie = req.couchAuth.body.userCtx.name;
  const targetUsername = req.body.user;
  const groupName  = req.params.group;

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
  group.assertExistence() // verify group exists
    .then(function assertTargetUser() {
      return targetUser.assertExistence();
    })
    .then(verifyRequester(req, requestingUser, group))
    .then(function addMember() {
      return targetUser.grantMember(group);
    })
    .then(function respondSuccess() {
      const message = `Member '${targetUsername}' added to group.`;
      res
        .status(HttpStatus.OK)
        .json({
          message : message
        });
    })
    .catch(errorHandler(res));
};


module.exports = addMember;