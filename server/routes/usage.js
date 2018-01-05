'use strict';

let Conf = require('../Conf');
var nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);

/*
db.get('acl', function(err, body) {
  console.log(JSON.stringify(body, null, 2))
  process.exit(0)
})
*/

const Group = require('../Group');
const User = require('../User');

const HttpStatus = require('http-status-codes');
const logger = require('../logger');

const verifyRequester = require('../utils/verifyRequester');
const errorHandler = require('../utils/errorHandler');

const usage = function (req, res) {
console.log(req.params)

  var getGroups = function(callback) {
    var groups = []
    getGroupNames(function(err, groupNames) { 
      if (err) return done(err)
      var i = 0
      var getNextGroup = function() {
        getGroup(groupNames[i], function(err, group) {
          if (err) return done(err)
          groups.push(group)
          i++
          if (groupNames.length == i) {
            callback(null, groups)
          }
          else {
            getNextGroup()
          }
        })
      }
      getNextGroup()
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
        if (req.params.hasOwnProperty('startdate')) options.startkey = parseInt(req.params.startdate)
        if (req.params.hasOwnProperty('enddate')) options.endkey = parseInt(req.params.enddate)
        db.view('ojai', 'resultsByUploadDate', options,  function(err, response) {
          group.numberOfResults = response.rows.length
          group.enumerator = response.rows[0].value
          group.uploadDate = response.rows[0].key
          callback(null, group)
        })
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
      callback(null, groupNames)
    })
  }

  getGroups(function(err, groups) {
    res.send(groups)
  })

}
module.exports = usage;
