'use strict';

let Settings = require('./Settings');

let Conf = {
  protocol: 'http://',
  sessionPath: '/_session',
  replicatePath: '/_replicate',
  usersDb: '/_users',
  userDocPrefix: '/org.couchdb.user:',
  groupPathPrefix: '/group-',
  calcGroupPath: function(groupName) {
    return `${this.groupPathPrefix}${groupName}`;
  },
  calcUserUrl: function(userName) {
    return `${this.userDbUrl}${this.userDocPrefix}${userName}`;
  },
  calcGroupUrl: function(groupName) {
    return `${this.protocol}${this.auth}${this.serverUrl}${this.calcGroupPath(groupName)}`;
  },
  calcSecurityUrl: function(groupName) {
    return `${this.protocol}${this.auth}${this.serverUrl}${this.calcGroupPath(groupName)}/_security`;
  }
};

let add = function(key, value) {
  Object.defineProperty(Conf, key, {
    value: value,
    writeable: false,
    configurable: false,
    enumerable: true
  });
}

add('auth', `${Settings.T_ADMIN}:${Settings.T_PASS}@`);
add('serverUrl', `${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}`);

add('replicateUrl', `${Conf.protocol}${Conf.auth}${Conf.serverUrl}${Conf.replicatePath}`);
add('sessionUrl', `${Conf.protocol}${Conf.auth}${Conf.serverUrl}${Conf.sessionPath}`);
add('noAuthSessionUrl', Conf.sessionUrl.replace(/\/\/.*@/g,'//'));
add('userDbUrl', `${Conf.protocol}${Conf.auth}${Conf.serverUrl}${Conf.usersDb}`);

// view shows which users are members or admins of which group
add('roleKeyUrl', `${Conf.userDbUrl}/_design/byRoleKey/_view/index`);



module.exports = Conf;