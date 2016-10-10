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

    console.log("APK creation initiated at " + Date())

    // assert a group name
    const groupNameRaw = req.params.group;
    // sanitize the group name
    var groupName = groupNameRaw.replace(/[^a-zA-Z0-9_\-]/,'')
    groupName = groupName.replace('group-','')
    const hostname = req.params[0];
    const emptyGroup = !groupNameRaw || groupNameRaw == ''
    if (emptyGroup) {
        return res
            .status(HttpStatus.BAD_REQUEST)
            .json({
                message : 'Missing group'
            });
    }

    // Summarize this job
    logger.info(groupName)

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

    // delete any old packs if they're there
    del([ '/tangerine-server/tree/client/src/js/init/pack*.json' ])
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

            // build the apk
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
                return;
              }
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
              res.status(HttpStatus.OK).json({
                  token : token
              });
            })

        })
        .catch(function noGroup(err) {
            console.log(err.stack)
            logger.error(err.msg);
        });

};

module.exports = makeApk;
