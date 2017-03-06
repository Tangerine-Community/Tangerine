'use strict';

const expect = require('expect.js');
const unirest = require('unirest');
const HttpStatus = require('http-status-codes');

const Conf = require('../Conf');

const Settings = require('../Settings');

const utils = require('./utils');

const apiUrl = `http://localhost:${Settings.T_ROBBERT_PORT}`;

describe('User', function() {

  before(function(){
    this.testUser   = utils.randomness(10);
    this.testPass   = 'password';
    this.userCookie = '';
  });

  describe('new', function() {
    it('should reject malformed requests', function(done) {
      unirest.put(`${apiUrl}/user`)
        .json({})
        .end(function(response){
          expect(response.status).to.be(HttpStatus.BAD_REQUEST);
          done()
        })
    });
    it('should make new user', function(done) {
      unirest.put(`${apiUrl}/user`)
        .json({
          name : this.testUser,
          pass : this.testPass
        })
        .end(function(response){
          expect(response.status).to.be(HttpStatus.CREATED);
          done()
        })
    });
  });

  describe('read/get', function(){

    it('should reject anonymous request for user details', function(done) {
      unirest.get(`${apiUrl}/user/${this.testUser}`)
        .send()
        .end(function(response){
          expect(response.status).to.be(HttpStatus.UNAUTHORIZED);
          done()
        })
    });

    it('should show own user`s details', function(done) {
      const self = this;
      unirest.post(Conf.noAuthSessionUrl)
        .json({
          name     : this.testUser,
          password : this.testPass
        })
        .end(function(response){
          const token = response.cookies.AuthSession; // get token
          unirest.get(`${apiUrl}/user/${self.testUser}`)
            .header('Cookie', 'AuthSession=' + token)
            .end(function(response) {
              expect(response.body.name).to.be(self.testUser);
              done()
            });
        });
    }); // it

    it('should show user`s details to server admin', function(done) {
      const self = this;
      unirest.post(Conf.noAuthSessionUrl)
        .json({
          name     : Settings.T_ADMIN,
          password : Settings.T_PASS
        })
        .end(function(response){
          const token = response.cookies.AuthSession; // get token
          unirest.get(`${apiUrl}/user/${self.testUser}`)
            .header('Cookie', 'AuthSession=' + token)
            .end(function(response){
              expect(response.body.name).to.be(self.testUser);
              done()
            });
        });
    }); // it

  }); // describe

  describe('delete', function() {
    it('should delete user as admin', function(done) {

      const self = this;

      // login first
      unirest.post(Conf.noAuthSessionUrl)
        .json({
          name     : Settings.T_ADMIN,
          password : Settings.T_PASS
        })
        .end(function(response){
          const token = response.cookies.AuthSession; // get token
          unirest.delete(`${apiUrl}/user/${self.testUser}`)
            .header('Cookie', 'AuthSession=' + token)
            .end(function(response){
              expect(response.code).to.be(HttpStatus.OK);
              done()
            })
        })
    });

    it('should make new user and delete as same user', function(done){
      const self = this;
      unirest.put(`${apiUrl}/user`)
        .json({
          name : self.testUser,
          pass : 'password'
        })
        .end(function(response){

          unirest.post(Conf.noAuthSessionUrl)
            .json({
              name     : self.testUser,
              password : 'password'
            })
            .end(function(response){
              const token = response.cookies.AuthSession; // get token
              unirest.delete(`${apiUrl}/user/${self.testUser}`)
                .header('Cookie', 'AuthSession=' + token)
                .end(function(response){
                  expect(response.code).to.be(HttpStatus.OK);
                  done()
                });
            });
        })
    });
  });
});