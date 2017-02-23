'use strict';

let Conf = require('./Conf');
var nano = require('nano')(Conf.protocol + Conf.auth + Conf.serverUrl);
var db = nano.db.use('tangerine');

module.exports = function(permission, user, callback) {

  db.get('acl', function(err, body) {
    if (err) return callback(err, false)
    body.roles.forEach(function(role) {
      if(user.roles.indexOf(role.name) !== -1 && role.permissions.indexOf(permission) !== -1) {
        return callback(null, true)
      }
      else {
        callback(null, false)
      }
    })
  })

}

