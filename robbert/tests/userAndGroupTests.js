'use strict';

var expect = require('expect.js');
var unirest = require('unirest');
var HttpStatus = require('http-status-codes');

var Conf = require('../Conf');

var Settings = require('../Settings');

const utils = require('./utils');

const apiUrl = `http://localhost:${Settings.T_ROBBERT_PORT}`;


describe("User and group interactions", function(){

  before(function createUser(done) {

    const self = this;

    self.testUser   = utils.randomness(10);
    self.testGroup  = utils.randomness(10);
    self.testPass   = 'password';
    self.userCookie = '';

    unirest.put(`${apiUrl}/user`)
      .json({
        name : self.testUser,
        pass : self.testPass
      })
      .end(function login(response){
        // login first
        unirest.post(Conf.noAuthSessionUrl)
          .json({
            name     : self.testUser,
            password : self.testPass
          })
          .end(function createGroup(response) {
            self.userCookie = response.cookies.AuthSession; // get token
            unirest.put(`${apiUrl}/group`)
              .header('Cookie', 'AuthSession=' + self.userCookie)
              .json({name:self.testGroup})
              .end(function(response) {
                done();
              })
          });

    });
  });

  it("should add an admin to a group", function(done){
    const self = this;
    unirest.post(`${apiUrl}/group/${self.testGroup}/add-admin`)
      .header('Cookie', 'AuthSession=' + self.userCookie)
      .json({user:self.testUser})
      .end(function(response){
        expect(response.status).to.be(HttpStatus.OK);
        done();
      });
  });

  it("should add a member to a group", function(done){
    const self = this;
    unirest.post(`${apiUrl}/group/${self.testGroup}/add-member`)
      .header('Cookie', 'AuthSession=' + self.userCookie)
      .json({user:self.testUser})
      .end(function(response){
        expect(response.status).to.be(HttpStatus.OK);
        done();
      });
  });

  it("should remove a member from a group", function(done){
    const self = this;
    unirest.post(`${apiUrl}/group/${self.testGroup}/remove-member`)
      .header('Cookie', 'AuthSession=' + self.userCookie)
      .json({user:self.testUser})
      .end(function(response){
        expect(response.status).to.be(HttpStatus.OK);
        done();
      });

  });

  it("should remove an admin from a group", function(done){
    const self = this;
    unirest.post(`${apiUrl}/group/${self.testGroup}/remove-admin`)
      .header('Cookie', 'AuthSession=' + self.userCookie)
      .json({user:self.testUser})
      .end(function(response){
        expect(response.status).to.be(HttpStatus.OK);
        done();
      });

  });

  after(function login(done){
    const self = this;
    unirest.post(Conf.noAuthSessionUrl)
      .json({
        name     : Settings.T_ADMIN,
        password : Settings.T_PASS
      })
      .end(function deleteGroup(response) {
        const token = response.cookies.AuthSession; // get token
        unirest.delete(`${apiUrl}/group/${self.testGroup}`)
          .header('Cookie', 'AuthSession=' + token)
          .end(function deleteUser(response) {
            unirest.delete(`${apiUrl}/user/${self.testUser}`)
              .header('Cookie', 'AuthSession=' + token)
              .end(function deleteDatabase(response){
                unirest.delete(Conf.calcGroupUrl(self.testGroup).replace(/group\-/,'deleted-'))
                  .header('Cookie', 'AuthSession=' + token)
                  .end(function(response){
                    done()
                  })
              })

          });
      });
  });

});

