'use strict';

const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const errorHandler = require('../../utils/errorHandler');

/** Deletes a user. */
const deleteUser = function(req, res) {

  const notEvenLoggedIn = req.couchAuth.body.userCtx.name === null;

  if (notEvenLoggedIn) {
    return res.status(HttpStatus.UNAUTHORIZED)
      .json({
        message : "You're not logged in"
      });
  }

  const targetUser = new User({
    name: req.params.name
  });

  const requesterIsntAdmin = req.couchAuth.body.userCtx.roles.indexOf('_admin') === -1;
  const requesterIsntDeletee = req.couchAuth.body.userCtx.name !== targetUser.name();
  if (requesterIsntAdmin && requesterIsntDeletee) {
    return res.status(HttpStatus.UNAUTHORIZED)
      .json({
        message : "You're unauthorized"
      });
  }


  targetUser.delete()
    .then(function(response){
      res.status(response.status)
        .json({
          message : response.message
        });
    })
    .catch(errorHandler(res));

};

module.exports = deleteUser;