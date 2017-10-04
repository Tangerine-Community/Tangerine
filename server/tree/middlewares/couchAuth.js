'use strict';

const Conf = require('../Conf');
const unirest = require('unirest');

function couchAuth(req,res,next){

  let authHeaders = {
    'Content-Type' : 'application/json',
    'Accept'       : 'application/json'
  };

  const sessionCookie = req.cookies.AuthSession;

  // early exit
  // if there's no session cookie, just mock a response
  if (sessionCookie === undefined) {
    req.couchAuth = {body:{userCtx:{name:null,roles:[]}}};
    return next();
  }

  // ask couchdb who this is
  authHeaders.Cookie = `AuthSession=${sessionCookie}`;
  unirest.get(Conf.sessionUrl)
    .headers(authHeaders)
    .end(function handleAuthResponse( authResponse ) {
      req.couchAuth = authResponse;
      next();
    });
}

module.exports = couchAuth;