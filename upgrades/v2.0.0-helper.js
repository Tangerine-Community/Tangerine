'use strict';

let Conf = require('../server/Conf');
let User = require('../server/User');


let HttpStatus = require('http-status-codes');

let fs = require('fs')
let unirest = require('unirest');

const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};

const tangerineDb = `${Conf.protocol}${Conf.auth}${Conf.serverUrl}/tangerine`
const userDb = `${Conf.protocol}${Conf.auth}${Conf.serverUrl}/_users`
const couchUrl = `${Conf.protocol}${Conf.auth}${Conf.serverUrl}`

var dbAclDoc = {}
var fileAclDoc = {}
var usersToUpdateRole = []
var groupDbs = []
var locationSubtests = [] 

var upgrade = function() {
  return (new Promise(function startUpgrade(resolve, reject) {
    console.log("Starting upgrade...")
    resolve()
  }))
  .then(function getGroupDbs(resolve, reject) {
    return new Promise(function getGroupDbsPromise(resolve, reject) {
      console.log('Getting all Group databases.')
      unirest.get( couchUrl + '/_all_dbs' )
        .end( function onGroupDbsUrlGet(response) {
          var dbs = JSON.parse(response.body)
          console.log(JSON.stringify(dbs))
          dbs.forEach(function(db) {
            if (db.indexOf('group-') !== -1) {
              groupDbs.push(db)
            }
          })
          console.log('groupDbs:')
          console.log(groupDbs.length)
          resolve()
        })
    })
  })
  .then(function getAllLocationSubtests(resolve, reject) {
    return new Promise(function getAllLocationSubtestsPromise(resolve, reject) {
      console.log('Getting location subtests.')
      var i = 0
      var getLocationSubtestsInOneDatabase = function getLocationSubtestsInOneDatabase() {
        var db = groupDbs[i]
        unirest.get( `${couchUrl}/${db}/_design/ojai/_view/byCollection?include_docs=true&keys=["subtest"]`  )
          .end(function onGetAllSubtests(response) {
            var obj = JSON.parse(response.body) 
            var rows = obj.rows
            if (rows.length > 0) {
              rows.forEach(function forEachSubtest(row) {
                if (row.doc.prototype == 'location') { 
                  locationSubtests.push({ doc: row.doc,  
                                          path: `/${db}/${row.doc._id}` })
                }
              })
            }
            if ((i + 1) == groupDbs.length) {
              console.log('locationSubtests:')
              console.log(JSON.stringify(locationSubtests.length))
              return resolve()
            }
            else {
              i++
              return getLocationSubtestsInOneDatabase()
            }
          })
      }
      getLocationSubtestsInOneDatabase()
    })
  })
  .then(function updateLocationSubtests(resolve, reject) {
    return new Promise(function updateLocationSubtestsPromise(resolve, reject) {
      console.log('Updating all location subtests.')
      var i = 0
      var doneUpdatingLocationSubtest = function() {
        if ((i + 1) == locationSubtests.length) {
          console.log('All done updating location subtests.')
          return resolve()
        }
        else {
          i++
          updateLocationSubtest()
        }
      }
      var updateLocationSubtest = function updateLocationSubtest() {
        console.log('Updating one location subtest.')
        var locationSubtest = locationSubtests[i]
        if (locationSubtest.doc.hasOwnProperty('locationCols')) {
          console.log('Location subtest already has locationCols. Skipping.')
          return doneUpdatingLocationSubtest() 
        }
        locationSubtest.doc.locationCols = locationSubtest.doc.levels
        console.log('Saving updated Location Subtest.')
        unirest.put(couchUrl + locationSubtest.path)
          .headers({ 'Content-Type' : 'application/json'})
          .json(locationSubtest.doc)
          .end(function onLocationSubtestUpdate(response) {
            if (response.status !== 201) throw new Error(`Updating location subtest failed with status of ${response.status}`) 
            console.log('Done saving updated location subtest.')
            doneUpdatingLocationSubtest()
          })
      }
      updateLocationSubtest()
    })
  })
  .then(function getAclDocInDb(resolve, reject) {
    return new Promise(function getAclDocInDbPromise(resolve, reject){
      console.log('Updating Access Control List')
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
    })
  })
  .then(function getFileAcl() {
    console.log( "How the Access Control list works has changed. Add manager role to necessary users and overrwrite the acl document in the tangerine database.")
    return new Promise(function getFileAclPromise(resolve, reject){
      fs.readFile( '/tangerine/documents-for-new-groups/acl.json', 'utf-8', function(err, data) {
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
