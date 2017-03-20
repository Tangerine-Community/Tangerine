'use strict';

const User = require('../../User');

const HttpStatus = require('http-status-codes');
const logger = require('../../logger');

const errorHandler = require('../../utils/errorHandler');

/** Creates a new user. */
const newUser = function(req, res){
  const missingVariables = req.body.name === undefined || req.body.pass === undefined;
  if (missingVariables) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({
        message : "Missing request variables."
      })
      .end();
  }
  const user = new User({
    name : req.body.name,
    pass : req.body.pass
  });

  user.create()
    .then(function respondSuccess(response){
      res
        .status(response.status)
        .json({
          message : response.message
        });
    })
    .catch(errorHandler(res));

};

module.exports = newUser;