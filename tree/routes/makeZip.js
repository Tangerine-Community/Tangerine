'use strict';

const Conf = require('../Conf');

const Token = require('../Token');

const logger = require('../logger');

require('shelljs/global');

// for writeFile
const fs = require('fs');

// for mkdirp
const fse = require('fs-extra');

// a REST client
const unirest = require('unirest');

// for simple deleting with callbacks
const del = require('del');

// for standard http responses
const HttpStatus = require('http-status-codes');

// shell response idiom
const notOk = function(output, res, status) {
  if (output === undefined) { return; }
  const badExit = output.code !== 0;
  if (badExit) {
    logger.error(output.output);
    res
      .status(status)
      .json({msg:output.output})
      .end();
    return true;
  } else {
    return false;
  }
};

/** */
const makeTangerine = function(req, res) {

  // assert a group name
  const group = req.params.group;
  const emptyGroup = !group || group == ''
  if (emptyGroup) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({
        message : 'Missing group'
      });
  }

  // assert authorized user
  const notEvenLoggedIn = req.couchAuth.body.userCtx === undefined;
  if (notEvenLoggedIn) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({
        message : "You're not logged in."
      });
  }

  // assert a valid user within requested group
  const notAssociated = req.couchAuth.body.userCtx.roles.indexOf(`admin-${group}`) === -1;
  if (notAssociated) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({
        message : "Must be an admin to create APKs."
      });
  }


  // sanitize the group name
  const groupName = group.replace(/[^a-zA-Z0-9_\-]/,'')

  // make a token
  const token = Token.make();

  // load the json packs
  cd(`${__dirname}/../client`);
  const preload = exec(`npm run treeload --group=${groupName}`);
  if (notOk(preload, res, HttpStatus.INTERNAL_SERVER_ERROR)) { return; }

  // build the zip 
  cd(`${__dirname}/..`);
  const buildApk = exec(`zip -r ${Conf.APK_PATH}/${token}.zip client/`);
  if (notOk(buildApk, res, HttpStatus.INTERNAL_SERVER_ERROR)) { return; }

  res.status(HttpStatus.OK).json({
    token : token
  });

};

module.exports = makeApk;
