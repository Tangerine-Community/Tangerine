'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** Removes a member from a group. */
const removeMember = function(req, res) {

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
  group.assertExistence()
    .then(function assertTargetUser() {
      return targetUser.assertExistence();
    })
    .then(verifyRequester(req, requestingUser, group, targetUser))
    .then(function removeMember() {
      return targetUser.revokeMember(group);
    })
    .then(function respondSuccess() {
      const message = `Removed member '${targetUsername}' from group.`;
      res
        .status(HttpStatus.OK)
        .json({
          message : message
        });
    }).catch(errorHandler(res));
};

module.exports = removeMember;