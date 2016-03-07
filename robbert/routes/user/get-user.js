'use strict';

const User = require('../../User');

const HttpStatus = require('http-status-codes');

const errorHandler = require('../../utils/errorHandler');
const logger = require('../../logger');

/** Returns some basic user info. */
const getUser = function(req, res) {

  const notEvenLoggedIn = req.couchAuth.body.userCtx.name === null;

  if (notEvenLoggedIn) {
    return res.status(HttpStatus.UNAUTHORIZED)
      .json({
        message : 'Please log in'
      });
  }

  const targetUser = new User({
    name: req.params.name
  });

  const requesterIsntAdmin = req.couchAuth.body.userCtx.roles.indexOf('_admin') === -1;
  const requesterIsntSelf = req.couchAuth.body.userCtx.name !== targetUser.name();

  if (requesterIsntAdmin && requesterIsntSelf) {
    return res.status(HttpStatus.UNAUTHORIZED)
      .json({
        message : `Your user is unauthorized`
      });
  }

  targetUser.fetch()
    .then(function respondSuccess(response) {
      // build a simple groups object
      const groups = response.attributes.roles.reduce(function categorize(result, role) {
        if (role.indexOf('admin-') !== -1) { // isAdmin
          result.admin.push(role.substr(6, role.length)); // remove admin-
        } else if (role.indexOf('member-') !== -1) { // isMember
          result.member.push(role.substr(7, role.length)); // remove member-
        };
        return result;
      }, { admin : [], member : [] });

      res.status(response.status)
        .json({
          name    : response.attributes.name,
          created : response.attributes.created,
          updated : response.attributes.updated,
          groups  : groups
        });
    })
    .catch(errorHandler(res));

};

module.exports = getUser;