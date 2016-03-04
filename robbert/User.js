'use strict';

const Conf = require('./Conf');

const unirest = require('unirest');
const HttpStatus = require('http-status-codes');

const extend = require('util')._extend;

const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};

var User = function (attributes) {
  if (attributes === undefined) {
    throw new Error('Need a name at least.');
  }
  this.attributes = {};
  this.name(attributes.name);
  this.attributes._id      = `org.couchdb.user:${this.name()}`;
  this.attributes.password = attributes.pass;
  this.attributes.type     = 'user';
  this.attributes.roles    = [];
  return this;
};

/** Get the user doc from the database
 * @return {Promise} A promise
 */
User.prototype.fetch = function(force) {

  const self = this;

  if (this.attributes._rev && !force) {
    return new Promise(function fetched(resolve, reject){
      resolve({
        status : HttpStatus.OK,
        message : 'User fetched.',
        attributes: self.attributes
      });
    })
  }

  return new Promise(function fetchPromise(resolve, reject){
    unirest.get(Conf.calcUserUrl(self.name())).headers(JSON_OPTS)
      .end(function onUserResponse( response ) {
        var foundDoc = response.status > 199 && response.status < 299;
        if (foundDoc) {
          self.attributes = response.body;
          resolve({
            status  : response.status,
            message : 'User fetched',
            attributes : self.attributes
          });
        } else {
          resolve({
            status : response.status,
            message  : 'User does not exist'
          });
        }
      });
  });
};


User.prototype.create = function() {
  var self = this;
  self.attributes.created = (new Date()).toString();
  return new Promise(function(resolve,reject){
    unirest.put(Conf.calcUserUrl(self.name()))
      .json(self.attributes)
      .end(function onUserResponse( response ) {
        const status = parseInt(response.status);
        const somethingGood = status > 199 && status < 299;
        const userExists = status === 409;
        if (somethingGood) {
          resolve({
            status  : response.status,
            message : `User '${self.name()}' created`
          });
        } else if ( userExists) {
          reject({
            status  : response.status,
            message : `User '${self.name()}' already exists`
          });
        } else {
          reject({
            status : response.status,
            message  : (response.body||{}).reason || 'Error'
          });
        }
      });
  });
};


User.prototype.save = function() {
  var self = this;
  self.attributes.updated = (new Date()).toString();
  return new Promise(function(resolve, reject) {
    unirest.post(Conf.userDbUrl).headers(JSON_OPTS)
      .json(self.attributes)
      .end(function onUserResponse( response ) {
        const status = parseInt(response.status);
        const somethingGood = status > 199 && status < 400;
        if (somethingGood) {
          resolve({
            status  : status,
            message : `User '${self.name()}' deleted.`
          });
        } else {
          reject({
            status  : status,
            message : response.body.reason
          });
        }
      });
  });
};

User.prototype.delete = function() {
  const self = this;
  return self.fetch()
    .then(function(){
      self.attributes = {
        _id      : self.attributes._id,
        _rev     : self.attributes._rev,
        name     : self.name(), // urls generated with this
        _deleted : true
      }
      return self.save();
    })
};

// dash the curry
User.prototype.grantAdmin   = function(group) { return this.addRole('admin', group); };
User.prototype.grantMember  = function(group) { return this.addRole('member', group); };
User.prototype.revokeAdmin  = function(group) { return this.removeRole('admin', group); };
User.prototype.revokeMember = function(group) { return this.removeRole('member', group); };

// add user as an admin
User.prototype.addRole = function(role, group) {
  const self    = this;
  const roleKey = `${role}-${group.name()}`;
  return self.fetch()
    .then(function addRoleKey() {
      if (self.attributes.roles.indexOf(roleKey) === -1) {
        self.attributes.roles.push(roleKey);
        return self.save();
      } else {
        return Promise.reject({
          status  : HttpStatus.OK,
          message : `${role} '${self.name()}' already exists in '${group.name()}'`
        })
      }
    });
};

// remove role from user
User.prototype.removeRole = function(role, group) {
  const self    = this;
  const roleKey = `${role}-${group.name()}`;
  return self.fetch()
    .then(function filterRoleKey() {
      self.attributes.roles = self.attributes.roles.filter(function(oneGroup){ return oneGroup !== roleKey; });
      return self.save();
    });
};

// remove role from user
User.prototype.removeRoles = function(group) {
  const self     = this;
  const groupKey = `-${group.name()}`;
  return self.fetch()
    .then(function filterGroupKey() {
      self.attributes.roles = self.attributes.roles.filter(function(oneGroup){ return oneGroup.indexOf(groupKey) === -1; });
      return self.save();
    });
};
User.prototype.isAdmin = function(group) {
  const self = this;
  const roleKey = `admin-${group.name()}`;
  return new Promise(function(resolve, reject) {
    return self.fetch()
      .then(function() {
        const amAdmin = self.attributes.roles.indexOf(roleKey) !== -1;
        if (amAdmin) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
}

User.prototype.assertAdmin = function(group) {
  const self = this;
  const roleKey = `admin-${group.name()}`;
  return new Promise(function(resolve, reject){
    self.isAdmin(group)
      .then(function(amAdmin){
        if (amAdmin) {
          resolve();
        } else {
          reject({
            status: HttpStatus.UNAUTHORIZED,
            message: `User '${self.name()}' is not an admin`
          });
        }
      })
  });
};

User.prototype.assertExistence = function(){
  const self = this;
  return new Promise(function assertionPromise(resolve, reject){
    self.fetch(true)
      .then(function fulfilExistence(res) {
        if (res.status === HttpStatus.NOT_FOUND) {
          reject({
            status : HttpStatus.NOT_FOUND,
            message : `User '${targetUsername}' does not exist.`
          });
        } else {
          resolve();
        }
      });
  });
};

User.prototype.name = function(value){
  if (value === undefined) {
    return this.attributes.name;
  } else {
    return this.attributes.name = value;
  }
};

module.exports = User;