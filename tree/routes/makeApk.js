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

// for Path.join
let Path = require('path');

/** Configuration. */
// let Conf = {};

// how many documents will be put into a pack at most.
Object.defineProperty(Conf, "PACK_DOC_SIZE", {value: 50, writeable: false, configurable: false, enumerable: true});

// Where the json docs will go
Object.defineProperty(Conf, "PACK_PATH", {value: `/tangerine-server/client/src/js/init`, writeable: false, configurable: false, enumerable: true})

// Where the get the media assets
Object.defineProperty(Conf, "MEDIA_PATH", {value: `/tangerine-server/client/media_assets/`, writeable: true, configurable: false, enumerable: true})
Object.defineProperty(Conf, "APK_MEDIA_PATH", {value: `/tangerine-server/client/src/media_assets/`, writeable: true, configurable: false, enumerable: true})

/** Handle environment variables. */
let Settings = require('../client/scripts/Settings');

// shell response idiom
const notOk = function(output, res, status) {
  console.log("output of APK build process: " + output);
  if (output === undefined) { return; }
  const badExit = output.code !== 0;
  if (badExit) {
    console.log("bad exit: " + output.output);
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
const makeApk = function(req, res) {

  const groupNameRaw = req.params.group
  const groupName = (groupNameRaw.replace('group-','')).replace(/[^a-zA-Z0-9_\-]/,'')
  const hostname = req.params[0]
  const emptyGroup = !groupNameRaw || groupNameRaw == ''
  const groupMediaPath = Path.join(Conf.MEDIA_PATH, groupName)
  const groupAPKMediaPath = Path.join(Conf.APK_MEDIA_PATH,  groupName)

  // Assert group.
  if (emptyGroup) {
    return res
    .status(HttpStatus.BAD_REQUEST)
    .json({
        message : 'Missing group'
    });
  }

  // Summarize this job
  logger.info("APK creation initiated at " + Date() + " " + groupName)

  // Assert a valid user within requested group.
  logger.info("req.couchAuth.body.userCtx.roles: " + JSON.stringify(req.couchAuth.body))
  const notAssociated = req.couchAuth.body.userCtx.roles.indexOf(`admin-${groupName}`) === -1;
  if (notAssociated) {
    return res
    .status(HttpStatus.UNAUTHORIZED)
    .json({
      message : "Must be an admin to create APKs."
    });
   }

  // make a token
  const token = Token.make();
  var prepareData = function(donePreparingData) {
    // delete any old packs if they're there
    del([ '/tangerine-server/tree/client/src/js/init/pack*.json' ], {force: true})
    .then( function (paths) {
      if ( paths.length !== 0 ) {
        logger.debug(`Old json packs deleted: ${paths.map((p)=>p.substring(Conf.PACK_PATH.length)).join(', ')}`);
      }
    })
    .then(function writeDocs(msg) {
      // load the json packs
      cd(`${__dirname}/../client`);
      const treeLoad = exec(`npm run treeload --group=${groupName}`);
      if (notOk(treeLoad, res, HttpStatus.INTERNAL_SERVER_ERROR)) { return; }
      fse.remove(Conf.APK_MEDIA_PATH, function (err) {
        if (err) return console.error(err)
        fse.ensureDir(Conf.APK_MEDIA_PATH, function (err) {
          if (err) return console.error(err)
          fse.ensureDir(groupMediaPath, function (err) {
            if (err) {
              return donePreparingData() 
            }
            else {
              fse.copy(groupMediaPath, groupAPKMediaPath, function (err) {
                if (err) return donePreparingData(err) 
                donePreparingData()
              })
            }
          })
        })
      })
    })
    .catch(function noGroup(err) {
        console.log(err.stack)
        logger.error(err.msg);
    });
  }

  var buildOTAUpdateManifest = function(doneBuildOTAUpdateManifest) {
    const execer = require('child_process').exec;
    execer(`cd /tangerine-server/client/ && cordova-hcp build`, (error, stdout, stderr) => {
      doneBuildOTAUpdateManifest()
    })
  }

  // BuildIt function to use soon.
  var buildIt = function(doneBuildingIt) {
    cd(`${__dirname}/../client`);
    const buildApk = exec(`npm run build:apk`);
    if (notOk(buildApk, res, HttpStatus.INTERNAL_SERVER_ERROR)) { return; }
    // Make sure the directory is there
    cd(Conf.APP_ROOT_PATH);
    console.log("APK built; moving APK, token: " + token)
    // move the apk to the right directory
    const execer = require('child_process').exec;
    execer(`mv ${Conf.APK_PATH} ${Conf.APP_ROOT_PATH}/apks/${token}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      doneBuildingIt()
    })
  }

  // Go.
  prepareData(function(err) {
    if (err) return console.log(err)
    if (process.env.OTA_UPDATE) {
      buildOTAUpdateManifest(function(err) {
        if (err) return console.log(err) 
        buildIt(function(err) {
          if (err) return console.log(err) 
          res.status(HttpStatus.OK).json({
              token : token
          })
        })
      })
    } else {
      buildIt(function(err) {
        if (err) return console.log(err) 
        res.status(HttpStatus.OK).json({
            token : token
        })
      })
    }
  })

};

module.exports = makeApk;
