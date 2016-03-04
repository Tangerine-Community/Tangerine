'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** Removes a user from a group. If it's the last admin, delete the group. */
const leaveGroup = function (req, res) {

  // variables from url, cookies, and body
  const nameFromCookie = req.couchAuth.body.userCtx.name;
  const targetUsername = req.params.user;
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
    .then(function(){
      return group.getUsers(undefined, true);
    })
    .then(function leaveOrDestroyGroup(users) {
      const oneAdminLeft = users.admin.length === 1;
      const itsTheRequester = users.admin[0] === targetUser.name();
      if (oneAdminLeft && itsTheRequester) {
        logger.debug(`Deleting '${group.name()}'`);
        return group.destroy()
          .then(function respondSuccessDelete() {
            const message = `Deleted '${group.name()}'`;
            logger.info(message);
            res.status(HttpStatus.OK)
              .json({
                message : message
              });
          })
      } else {
        logger.debug(`Removing '${targetUser.name()}' from '${group.name()}'`);
        return targetUser.removeRoles(group)
          .then(function respondSuccess(){
            const message = `User '${targetUser.name()}' removed from '${group.name()}'.`;
            logger.info(message);
            res.status(HttpStatus.OK)
              .json({
                message : message
              });
          });
      }
    })
    .catch(errorHandler(res));

};

module.exports = leaveGroup;