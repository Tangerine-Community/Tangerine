'use strict';

const Group = require('../../Group');
const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const verifyRequester = require('../../utils/verifyRequester');
const errorHandler = require('../../utils/errorHandler');

/** returns the users for a group. */
const getGroup = function (req, res) {

  // variables from url, cookies, and body
  const nameFromCookie = req.couchAuth.body.userCtx.name;
  const groupName      = req.params.group;

  // associated models
  const requestingUser = new User({
    name : nameFromCookie
  });
  const group = new Group({
    name : groupName
  });

  // get to work
  group.assertExistence()
    .then(verifyRequester(req, requestingUser, group))
    .then(function addAdmin() {
      const roleKeys = undefined;
      const splitRoles = true;
      return group.getUsers(roleKeys, splitRoles); // function(roleKeys, split)
    })
    .then(function respondSuccess(response) {
      console.log(response)
      res
        .status(HttpStatus.OK)
        .json({
          message : `Ok`,
          admin  : response.admin,
          member : response.member
        });
    })
    .catch(errorHandler(res));
};

module.exports = getGroup;