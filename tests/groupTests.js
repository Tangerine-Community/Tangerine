'use strict';

var expect = require('expect.js');
var unirest = require('unirest');
var HttpStatus = require('http-status-codes');

var Conf = require('../Conf');

var Settings = require('../Settings');

const utils = require('./utils');

const apiUrl = `http://localhost:${Settings.T_ROBBERT_PORT}`;


describe('Group', function() {

  before(function(){
    this.testGroup  = utils.randomness(10);
    this.testPass   = 'password';
    this.userCookie = '';
  });

  it('should make a new group', function(done){
      const self = this;
      const msDelay = 15 * 1e3;
      this.timeout(msDelay);
      // login first
      unirest.post(Conf.noAuthSessionUrl)
        .json({
          name     : Settings.T_ADMIN,
          password : Settings.T_PASS
        })
        .end(function(response) {
          const token = response.cookies.AuthSession; // get token
          unirest.put(`${apiUrl}/group`)
            .header('Cookie', 'AuthSession=' + token)
            .json({name:self.testGroup})
            .end(function(response) {
              expect(response.code).to.be(HttpStatus.CREATED);
              done();
            })
        })
  });
  it('delete that group', function(done){
    const self = this;
    const msDelay = 15 * 1e3;
    this.timeout(msDelay);
    // login first
    unirest.post(Conf.noAuthSessionUrl)
      .json({
        name     : Settings.T_ADMIN,
        password : Settings.T_PASS
      })
      .end(function(response) {
        const token = response.cookies.AuthSession; // get token
        unirest.delete(`${apiUrl}/group/${self.testGroup}`)
          .header('Cookie', 'AuthSession=' + token)
          .end(function(response) {
            expect(response.code).to.be(HttpStatus.OK);
            done();
          });
      });
  });

  // clean up
  after(function login(done){
    const self = this;
    unirest.post(Conf.noAuthSessionUrl)
      .json({
        name     : Settings.T_ADMIN,
        password : Settings.T_PASS
      })
      .end(function deleteDatabase(response) {
        const token = response.cookies.AuthSession; // get token
        unirest.delete(Conf.calcGroupUrl(self.testGroup).replace(/group\-/,'deleted-'))
          .header('Cookie', 'AuthSession=' + token)
          .end(function(response){
            done()
          })
      })

  });
});
