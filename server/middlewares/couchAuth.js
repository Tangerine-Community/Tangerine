'use strict';

const Conf = require('../Conf');
const unirest = require('unirest');
const basicAuth = require('basic-auth')

function couchAuth(req,res,next){

  let authHeaders = {
    'Content-Type' : 'application/json',
    'Accept'       : 'application/json'
  };

  const sessionCookie = req.cookies.AuthSession;
  const credentials = basicAuth(req)
  
  if (credentials !== undefined) { 
    unirest.get(`http://${process.env.T_ADMIN}:${process.env.T_PASS}@127.0.0.1:5984/_users/org.couchdb.user:${credentials.name}/`)
      .end(function handleAuthResponse( authResponse ) {
        req.couchAuth = {body:{userCtx:JSON.parse(authResponse.body)}}
        next();
      });

  }
  else if (sessionCookie === undefined) {
    req.couchAuth = {body:{userCtx:{name:'',roles:[]}}};
    return next();
  }
  else {
    // ask couchdb who this is
    authHeaders.Cookie = `AuthSession=${sessionCookie}`;
    unirest.get(Conf.noAuthSessionUrl)
      .headers(authHeaders)
      .end(function handleAuthResponse( authResponse ) {
        req.couchAuth = authResponse;
        next();
      });
  }
}

module.exports = couchAuth;
