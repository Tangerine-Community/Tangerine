'use strict';

const Conf = require('../Conf');
const unirest = require('unirest');
const basicAuth = require('basic-auth')

function couchAuth(req,res,next){
  if (req.couchAuth.body.userCtx.name !== process.env.T_ADMIN) {
    res.send('You do not have permission to view this')
  } else {
    next()
  }
}

module.exports = couchAuth;
