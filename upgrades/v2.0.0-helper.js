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
var userDb = `${Conf.protocol}${Conf.auth}${Conf.serverUrl}/_users`


var dbAclDoc = {}
var fileAclDoc = {}
var usersToUpdateRole = []

var upgrade = function upgrade() {
  const self = this;
  return (new Promise(function getAclDocInDb(resolve, reject) {
    unirest.get( tangerineDb + '/acl' )
      .end( function onDbCreateResponse(response) {
        if (response.status === HttpStatus.OK ) {
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
  .then(function addMangerRoleToAllUsersInOldAclGroups(){
    return new Promise(function addMangerRoleToAllUsersInOldAclGroupsPromise(resolve, reject){
      // Resolve if there is no groups property in the ACL doc.
      if (!dbAclDoc.hasOwnProperty('groups')) return resolve()
      var userNames = dbAclDoc.groups[0].users
      var i = 0
      // Recursive function to iterate over the user names in the ACL doc.
      var addManagerRoleToOneUser = function addManagerRoleToOneUser(callback) {
        var userName = userNames[i]
        if (userName == process.env.T_ADMIN) {
          i++
          userName = userNames[i]
        }
        if (!userName) {
          return resolve()
        }
        i++
        unirest.get(userDb + '/org.couchdb.user:' + userName)
          .end(function onGetUserResponse(response) {
            if (response.status !== HttpStatus.OK ) return reject(response.body)
            var userDoc = JSON.parse(response.body)
            if (userDoc.roles.indexOf("manager") !== -1) return addManagerRoleToOneUser() 
            console.log('Adding the manager role to ' + userName) 
            userDoc.roles.push("manager")
            unirest.put(userDb + '/org.couchdb.user:' + userName).headers(JSON_OPTS)
              .json(userDoc)
              .end(function onUpdateUserResponse(response) {
                if (response.status > 199 && response.status < 399 ) return addManagerRoleToOneUser()
                reject(response)
              })
          })
      }
      addManagerRoleToOneUser()
    })
  })
}

upgrade()
  .catch(function(res) {
     console.log(res) 
  })
