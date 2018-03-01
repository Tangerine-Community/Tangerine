'use strict';

let Conf = require('./Conf');
var nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);

let User = require('./User');

let HttpStatus = require('http-status-codes');

let unirest = require('unirest');
let crypto = require('crypto');
const logger = require('./logger');
const errorHandler = require('./utils/errorHandler');

const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};



/** Group represents a CouchDB database.
* @param {Object} attributes      Properties the new group should have.
* @param {string} attributes.name The name of the new group.
* @return {Object} A newly created object for chaining.
*/
let Group = function Group( attributes ) {
  if (attributes === undefined) {
    throw new Error('Need a name at least.');
  }

  this.attributes = {};
  this.name(attributes.name);
  return this;
};

/** Assert that the group exists.
* @return {Promise} - A promise that always resolves.
*/
Group.prototype.assertExistence = function() {
  const self = this;
  return new Promise( function assertionPromise( resolve, reject ) {
    unirest.get( Conf.calcGroupUrl( self.name() ) )
      .end( function onGroupResponse( groupResponse ) {
        const statusGood = groupResponse.status > 199 && groupResponse.status < 299;
        if ( statusGood ) {
          resolve();
        } else {
          reject({
            status: HttpStatus.NOT_FOUND,
            message: 'Group does not exist.'
          });
        }
      });
  });
};

/** Makes a new group. */
Group.prototype.create = function create() {

  const uploaderPassword = crypto.randomBytes( 20 ).toString('hex');
  const self = this;
  const groupDbName = Conf.calcGroupPath( self.name() ).replace('/','');
  const groupResultsDbName = groupDbName + '-result';
  const groupResultsDbUrl = Conf.calcGroupUrl( self.name() + '-result' )

  return (new Promise(function newDatabase(resolve, reject) {
    unirest.put( Conf.calcGroupUrl( self.name() ) )
      .end( function onDbCreateResponse(response) {
        if (response.status === HttpStatus.CREATED ) {
          return resolve();
        } else if (response.status === HttpStatus.PRECONDITION_FAILED) {
          return reject({
            status: response.status,
            message: `Group already exists`
          })
        } else {
          return reject(response);
        }
      })
  }))
  .then(function replicate() {
    return new Promise(function replicatePromise(resolve, reject){
      unirest.post( Conf.replicateUrl ).headers(JSON_OPTS)
        .json({
          source  : 'tangerine',
          target  : groupDbName,
          doc_ids : ['_design/ojai', '_design/dashReporting', 'configuration', 'settings', 'templates', 'location-list']
        })
        .end(function onReplicateResponse( response ){
          if (response.status > 199 && response.status < 399 ) {
            return resolve();
          }
          reject(response);
        });
    });
  })
  .then(function makeUploader(){
    let userAttributes = {
      name     : 'uploader-' + self.name(),
      password : uploaderPassword
    };
    return (new User(userAttributes)).create();
  })
  .then( function changeSettings() {
    return new Promise(function changeSettingsPromise(resolve, reject){
      unirest.get( Conf.calcGroupUrl( self.name() ) + '/settings').headers(JSON_OPTS)
        .end( function alterDoc( response ) {
          let newDoc = response.body;
          newDoc.groupCreated = (new Date()).toString();
          newDoc.upPass = uploaderPassword;
          newDoc.groupName = self.name();
          unirest.post( Conf.calcGroupUrl( self.name() )).headers(JSON_OPTS)
            .json( newDoc )
            .end(function saveDoc(response){
              if (response.status === 201 ) {
                resolve();
              } else {
                reject(response);
              }
            });
        });
    }); // changeSettingsPromise
  })
  .then(function addGroupRoles(){
    return new Promise(function addGroupPromise(resolve, reject){
      const securityDoc = {
        admins: {
          names : [],
          roles : [`admin-${self.name()}`] // for use on the server
        },
        members: {
          names : [`uploader-${self.name()}`], // used by the tablets for write access
          roles : [`member-${self.name()}`] // for use on the server
        }
      };
      return unirest.put( Conf.calcSecurityUrl(self.name()) ).headers(JSON_OPTS)
        .json(securityDoc)
        .end(function(response) {
          if (response.status === 200 ) {
            resolve();
          } else {
            reject(response);
          }
        });
    });
  }) // return promise
  .then(function newResultsDatabase() {
      return new Promise(function newResultsDatabasePromise(resolve, reject) {
        logger.info('groupResultsDbUrl is: ' + groupResultsDbUrl)
        unirest.put(groupResultsDbUrl)
          .end(function onDbCreateResponse(response) {
            logger.info('response.status is: ' + response.status)
            if (response.status === HttpStatus.CREATED) {
              return resolve();
            } else if (response.status === HttpStatus.PRECONDITION_FAILED) {
              return reject({
                status: response.status,
                message: `Group ${groupResultsDbName} already exists`
              })
            } else {
              return reject(response);
            }
          })
      })
    })
  .then(function replicate() {
    return new Promise(function replicatePromise(resolve, reject){
      unirest
        .post(Conf.replicateUrl)
        .headers(JSON_OPTS)
        .json({
          source: 'tangerine',
          target: groupResultsDbName,
          doc_ids: ['_design/ojai', '_design/dashReporting']
        })
        .end(function onReplicateResponse(response) {
          if (response.status > 199 && response.status < 399) {
            return resolve();
          }
          reject(response);
        });
    });
  });
}; // create

// Replicates to a deleted- database.
// remove references to group on all users docs
// get all those user's docs and remove this group from their group
// remove the uploader user altogether
Group.prototype.destroy = function destroy() {
  const self = this;
  const groupName = self.name();
  const groupDbName = Conf.calcGroupPath( groupName ).replace('/','');
  const deletedDbName = Conf.calcDeletedPath( groupName ).replace('/','');
  return (new Promise(function(resolve, reject){
    // back up first
    unirest.post( Conf.replicateUrl ).headers(JSON_OPTS)
      .json({
        source : groupDbName,
        target : deletedDbName,
        create_target : true
      })
      .end(function(response){
        if (response.status > 199 && response.status < 400 ) {
          resolve();
        } else {
          reject(response);
        }
      })
  }))
  .then( function getUsers() {
    return self.getUsers();
  })
  .then( function onResolveFetch( usernames ) {
    const nameFns = usernames.map( function promiseFactory( username ) {
      // Promise to remove the group from the user doc
      return new Promise( function userPromise( resolve, reject ) {
        return ( new User({name : username}) )
          .removeRoles( self )
          .then( function afterSave() {
            resolve('removed');
          })
          .catch( function onError( err ) {
            reject( err );
          });
      }); // End of new Promise
    }); // End of map

    let promises = Promise.all( nameFns )
    return promises; // Send it up
  })
  .then( function destroyUploaderUser() {
    let uploader = new User({ name : 'uploader-' + groupName })
    return uploader.delete();
  })
  .then(function deleteDatabase(){
    return new Promise(function(resolve, reject){
      unirest.delete(Conf.calcGroupUrl(self.name())).header(JSON_OPTS)
        .end(function(response){
          if (response.status > 199 && response.status < 400 ) {
            resolve();
          } else {
            reject(response);
          }
        })
    });
  })
  .then(function lockDownDeletedGroup(){
    return new Promise(function addGroupPromise(resolve, reject){
      const securityDoc = {
        admins: {
          names : [ process.env.T_ADMIN ],
          roles : []
        },
        members: {
          names : [ process.env.T_ADMIN ],
          roles : []
        }
      };
      return unirest.put( Conf.calcDeletedUrl(self.name()) + '/_security' ).headers(JSON_OPTS)
        .json(securityDoc)
        .end(function(response) {
          if (response.status === 200 ) {
            resolve();
          } else {
            reject(response);
          }
        });
    });
  });

};

Group.prototype.getAdmins = function(){
  return this.getUsers([`admin-${self.name()}`]);
}

Group.prototype.getMembers = function(){
  return this.getUsers([`member-${self.name()}`]);
}

Group.prototype.getUsers = function(roleKeys, splitRoles) {
  splitRoles = Boolean(splitRoles);
  const self = this;
  if (roleKeys === undefined) {
    roleKeys = [`admin-${self.name()}`,`member-${self.name()}`];
  }
  return new Promise(function(resolve, reject){
    unirest.post(Conf.roleKeyUrl+'?group=true').headers(JSON_OPTS)
      .json({ keys : roleKeys })
      .end(function(response){
        if (response.status > 199 && response.status < 400) {
          let users = null;
          if (! splitRoles) {
            users = [];
            response.body.rows.forEach(function(row){users = users.concat(row.value);})
          } else if (splitRoles) {
            users = {admin:[],member:[]};
            response.body.rows.forEach(function(row) {
              row.value.forEach(function(user){
                if (row.key.charAt(0) === 'a') {
                  users.admin.push(user);
                } else if (row.key.charAt(0) === 'm') {
                  users.member.push(user);
                }
              });
            });
          } // end if
          resolve(users);
        } else {
          reject(new Error(`CouchDB responded ${response.status}: ${JSON.stringify(response.body)}`));
        }
      })
  })
};


// Name getter/setter
Group.prototype.name = function(value){
  if (value === undefined) {
    return this.attributes.name;
  } else {
    return this.attributes.name = value;
  }
};

Group.prototype.getGroups = function () {
  logger.info("getting groups.")

  var getGroups = function(callback) {
    var groupsArray = []
    getGroupNames(function(err, groupNames) {
      if (err) return done(err)
      callback(null, groupsArray)
      // var i = 0
      // var getNextGroup = function() {
      //   getGroup(groupNames[i], function(err, group) {
      //     if (err) return done(err)
      //     groupsArray.push(group)
      //     i++
      //     if (groupNames.length == i) {
      //       logger.info("groupsArray:" + groupsArray)
      //       callback(null, groupsArray)
      //     }
      //     else {
      //       getNextGroup()
      //     }
      //   })
      // }
      // getNextGroup()
    })
  }

  var getGroup = function(groupName, callback) {
    const group = new Group({
      name : groupName
    });
    group.assertExistence()
      .then(function addAdmin() {
        const roleKeys = undefined;
        const splitRoles = true;
        return group.getUsers(roleKeys, splitRoles); // function(roleKeys, split)
      })
      .then(function respondSuccess(response) {
        group.users = response
        var db = nano.db.use('group-' + groupName)
        var options = { descending: false }
        // if (req.params.hasOwnProperty('startdate')) options.startkey = parseInt(req.params.startdate)
        // if (req.params.hasOwnProperty('enddate')) options.endkey = parseInt(req.params.enddate)
        // db.view('ojai', 'resultsByUploadDate', options,  function(err, response) {
        //   group.numberOfResults = response.rows.length
        //   callback(null, group)
        // })
      })
      .catch(errorHandler('foo'));
  }

  var getGroupNames = function(callback) {
    nano.db.list(function(err, databases) {
      if (err) return callback(err)
      var groupNames = []
      databases.forEach(function(databaseName) {
        if (databaseName.search('group-') !== -1) {
          groupNames.push(databaseName.replace('group-', ''))
        }
      })
      logger.info('groupNames:' + groupNames)
      callback(null, groupNames)
    })
  }

  let groups = getGroups(function(err, groupsArray) {
    return groupsArray
  })
  console.log('groups: ' + groups)
  return groups;
}


module.exports = Group;
