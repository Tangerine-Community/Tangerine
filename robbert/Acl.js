'use strict';

var nano = require('nano')('http://admin:password@localhost:5984');
var db = nano.db.use('tangerine');

module.exports = function(permission, user, context, callback) {

  db.get('acl', function(err, body) {
    body.groups.forEach(function(group) {
      if(group.users.indexOf(user) !== -1 && group.permissions.indexOf(permission) !== -1) {
        return callback(null, true)
      }
      else {
        callback(null, false)
      }
    })
  })

}

