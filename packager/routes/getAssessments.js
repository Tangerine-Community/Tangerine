'use strict';

const Conf = require('../Conf');

const Token = require('../Token');

const logger = require('../logger');

const treeload = require('../treeload')

require('shelljs/global');

// for joining urls
let urljoin = require('url-join');

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

// for logging
let winston = require('winston');

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
Object.defineProperty(Conf, "PACK_PATH", {value: `${__dirname}/../packs`, writeable: false, configurable: false, enumerable: true})

let Settings = require('../Settings.js');


/** */
let getAssessment = function(req, res) {

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

  // res.json({"foo": "bar"})

    // // assert authorized user
    // const notEvenLoggedIn = req.couchAuth.body.userCtx === undefined;
    // if (notEvenLoggedIn) {
    //   return res
    //     .status(HttpStatus.UNAUTHORIZED)
    //     .json({
    //       message : "You're not logged in."
    //     });
    // }
    //
    // // assert a valid user within requested group
    // const notAssociated = req.couchAuth.body.userCtx.roles.indexOf(`admin-${group}`) === -1;
    // if (notAssociated) {
    //   return res
    //     .status(HttpStatus.UNAUTHORIZED)
    //     .json({
    //       message : "Must be an admin to create APKs."
    //     });
    // }
  // console.log("group: " + group)
  if (group != "favicon.ico") {

    // sanitize the group name
    const groupName = group.replace(/[^a-zA-Z0-9_\-]/, '')
    console.log("groupName: " + groupName)

    // make a token
    // const token = Token.make();

    // load the json packs
    // cd(`${__dirname}/../client`);
    // const preload = exec(`npm run treeload --group=${groupName}`);
    // let output = treeload(groupName)


    let JSON_HEADERS = {
      'Accept'       : 'application/json',
      'Content-Type' : 'application/json'
    }

// make sure the json pack directory is there
    fse.ensureDirSync(Conf.PACK_PATH);


// Helper method for gets
    let get = function(url){
      logger.debug(`GET ${url}`);
      return new Promise(function(resolve, reject){
        unirest.get(url)
            .auth({
              user: Settings.T_ADMIN,
              pass: Settings.T_PASS,
              sendImmediately: true
            })
            .headers(JSON_HEADERS)
            .end(function(res){
              if ( res.code >= 400 ) {
                return reject({code: res.code, msg: `${url} ${res.raw_body}`});
              }
              resolve(res);
            }); // get
      })
    };

// Helper method for posts
    let post = function(url, data){
      // res.json({"foo": "post"})
      if (!data) {data= {}}
      return new Promise(function(resolve, reject){
        logger.debug(`POST ${url} data: ${JSON.stringify(data)}`);
        unirest.post(url)
            .auth({
              user: Settings.T_ADMIN,
              pass: Settings.T_PASS,
              sendImmediately: true
            })
            .headers(JSON_HEADERS)
            .send(JSON.stringify(data))
            .end(function(res){
              if ( res.code >= 400 ) {
                return reject({code: res.code, msg: `${url} ${res.raw_body}`});
              }
              resolve(res);
            }); // post
      })
    };

// Set up the logger
    var logger = new winston.Logger({
      level: Settings.T_LOG_LEVEL,
      transports: [
        new (winston.transports.Console)()
      ]
    });

    // Summarize this job
    logger.info(groupName)
    let assessments = ""
    const SOURCE_GROUP = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}/group-${groupName}`;

    // delete any old packs if they're there
    del([ Path.join(Conf.PACK_PATH, 'pack*.json') ])
        .then( function (paths) {
          if ( paths.length !== 0 ) {
            logger.debug(`Old json packs deleted: ${paths.map((p)=>p.substring(Conf.PACK_PATH.length)).join(', ')}`);
          }
        })
        .then(function checkGroupExistence() {
          return get(SOURCE_GROUP);
        })
        .then(function getIds() {
          // Get a list of _ids for the assessments not archived
          return post(urljoin(SOURCE_GROUP, "/_design/ojai/_view/assessmentsNotArchived"))
        })
        .then(function getAllDocs(response) {
          // transform them to dKeys
          let keys = response.body.rows.map((row) => row.id.substr(-5))
          let dKeyQuery = {
            keys: keys
        };

          // get a list of docs associated with those assessments
          return post(urljoin(SOURCE_GROUP, "/_design/ojai/_view/byDKey?"), dKeyQuery)
        })
        .then(function getIdList(response) {

          var idList = response.body.rows.map((row) => row.id);
          idList.push("settings");
          let idListQuery = {
            keys: idList,
            include_docs:true
          }
          post(urljoin(SOURCE_GROUP, "/_all_docs?include_docs=true"), idListQuery)
              .then(function(response){

                let fileName = Path.join(Conf.PACK_PATH, `/pack${groupName}.json`);
                // console.log("res.body: " + JSON.stringify(res.body.rows))
                let docs = response.body.rows.map( (row) => row.doc );
                let body = {
                  docs: docs
                };
                assessments = body
                fs.writeFile(fileName, body, function(err) {
                  if (err) {
                    console.log(err.stack)
                    logger.error(err);
                    // return process.exit(1);
                  }
                })

                // res.setHeader('Content-Type', 'application/json')
                res.json(assessments)

                // return assessments;
              }); // END of get _all_docs
        })
        .catch(function noGroup(err) {
          console.log(err.stack)
          logger.error(err.msg);
        })
  }

};

module.exports = getAssessment;