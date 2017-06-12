'use strict';

let Conf = require('./Conf');
let User = require('./Result');

let HttpStatus = require('http-status-codes');

let unirest = require('unirest');
let crypto = require('crypto');

const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};



/** Result represents a CouchDB database result document.
* @param {Object} attributes      Properties the new group should have.
* @param {string} attributes.id The name of the new group.
* @return {Object} A newly created object for chaining.
*/
let Result = function Result( attributes ) {
  if (attributes === undefined) {
    throw new Error('Result: Need an ID at least.');
  }

  this.groupName = attributes.groupName;

  this.attributes = {};
  this.attributes._id = attributes.id;
  return this;
};

/** 
 * Get the result doc from the database
 * @return {Promise} A promise
 */
Result.prototype.fetch = function() {

  const self = this;

  return new Promise(function fetchPromise(resolve, reject){
    unirest.get(Conf.calcGroupDocUrl(self.groupName, self.attributes._id)).headers(JSON_OPTS)
      .end(function onResultResponse( response ) {
        var foundDoc = response.status > 199 && response.status < 299;
        if (foundDoc) {
          console.log("Result - Found Result");
          self.attributes = response.body;
          resolve({
            status  : response.status,
            message : 'Result fetched',
            attributes : self.attributes
          });
        } else {
          reject({
            status : response.status,
            message  : 'Result does not exist'
          });
        }
      });
  });
};


module.exports = Result;
