'use strict';

const Conf = require('../Conf');

require('shelljs/global');

const logger = require('../logger');

const Path = require('path');

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


/** Sends an APK made by makeApk */
const getApk = function(req, res){

  const token = req.params.token;
  const language = req.params.language;

  // You can't always get what you want
  const emptyToken = !token || token == ''
  if (emptyToken) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({
        message : 'Missing group'
      });
  }

  // differentiate between default requests and requests for x86 apks.
  const x86Request = token.indexOf('.x86') !== -1;
  let apkPath = '';
  let downloadName = '';

  if (x86Request) {
    apkPath = Path.join(Conf.APP_ROOT_PATH, 'apks', `${token.substr(0,token.length-4)}-x86`);
    downloadName = 'tangerine-x86.apk';
  } else {
    apkPath = Path.join(Conf.APP_ROOT_PATH, 'apks', token);
    downloadName = 'imlp_' + language + '.apk';
  }

  // see if the file is there
  fs.access(apkPath, fs.F_OK, function(err) {
    if (!err) {
      res.download(apkPath, downloadName);
    } else {
      res.status(HttpStatus.NOT_FOUND)
        .json({
          message: `No APK found for ${token}.`
        });
    }
  });

}

module.exports = getApk;