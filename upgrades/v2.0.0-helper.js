'use strict';

let Conf = require('../server/Conf');
let User = require('../server/User');


let HttpStatus = require('http-status-codes');

let fs = require('fs')
let unirest = require('unirest');
let crypto = require('crypto');

const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};

console.log( "How the Access Control list works has changed. Add manager role to necessary users and overrwrite the acl document in the tangerine database.")

var tangerineDb = `${Conf.protocol}${Conf.auth}${Conf.serverUrl}/tangerine`
console.log(tangerineDb)
console.log(JSON.stringify(Conf))


var dbAclDoc = {}
var fileAclDoc = {}
var usersToUpdateRole = []

var upgrade = function upgrade() {
  const self = this;
  return (new Promise(function getAclDocInDb(resolve, reject) {
    unirest.get( tangerineDb + '/acl' )
      .end( function onDbCreateResponse(response) {
        if (response.status === HttpStatus.OK ) {
          console.log('woot1')
          dbAclDoc = JSON.parse(response.body)
          return resolve();
        } 
        else {
          return reject(response);
        }
      })
  }))
  .then(function getFileAcl() {
    return new Promise(function getFileAclPromise(resolve, reject){
      console.log('woot2')
      fs.readFile( '/tangerine-server/documents-for-new-groups/acl.json', 'utf-8', function(err, data) { 
        if (err) { 
          console.log(err)
          reject(response);
        }
        else {
          fileAclDoc = JSON.parse(data)
          return resolve();
        }
      });
    });
  })
  .then(function uploadNewAcl(){
    return new Promise(function uploadNewAclPromise(resolve, reject){
      var newAclDoc = Object.assign({}, fileAclDoc) 
      newAclDoc._rev = dbAclDoc._rev
      unirest.put( tangerineDb + '/acl' ).headers(JSON_OPTS)
        .json( newAclDoc )
        .end(function onNewAclPostResponse( response ) {
          if (response.status > 199 && response.status < 399 ) {
            return resolve();
          }
          reject(response);
        })
    })
  })
}

upgrade()
  .catch(function(res) {
     console.log(res) 
  })
