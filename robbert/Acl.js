'use strict';

let Conf = require('./Conf');
var nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
var db = nano.db.use('tangerine');

module.exports = function(permission, user, context, callback) {

  db.get('acl', function(err, body) {
    if (err) return callback(err, false)
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

