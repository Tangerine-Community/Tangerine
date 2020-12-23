const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const util = require('util')
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const express = require('express')
const path = require('path')
const sanitize = require('sanitize-filename');
const exec = util.promisify(require('child_process').exec)
var isAuthenticated = require('../../middleware/is-authenticated.js')

module.exports = {
  name: 'dat-output',
  hooks: {
    declareAppRoutes: function(data) {
      return new Promise(async (resolve, reject) => {
        const { app } = data
        app.use('/app/:group/dat-output', isAuthenticated, function (req, res, next) {
          let contentPath = '/dat-output/' + req.params.group
          clog("Setting path to " + path.join(__dirname, contentPath))
          return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
        });
        app.use('/app/:group/dat-output-url', isAuthenticated, async function (req, res, next) {
          let contentPath = '/dat-output/' + sanitize(req.params.group)
          const result = await exec(`cd ${contentPath} && dat status | grep dat | tr -d '[:space:]'`)
          const datUrl = result.stdout.replace('\u001b[?25l','')
          return res.send({datUrl});
        });
        resolve(data)
      })
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
          const {groupName, appConfig} = data
          try {
            await mkdir('/dat-output')
          } catch (e) { }
          try {
            await mkdir(`/dat-output/${groupName}`)
            await exec(`cp /tangerine/server/src/modules/dat-output/response-viewer-app.html /dat-output/${groupName}/index.html`)
          } catch(e) { }
          resolve(data)
      })
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
          const {flatResponse, doc, sourceDb} = data
          try {
            await mkdir('/dat-output')
          } catch (e) { }
          try {
            await mkdir(`/dat-output/${sourceDb.name}`)
          } catch(e) { }
          await writeFile(
            `/dat-output/${sourceDb.name}/${doc._id}.json`,
            JSON.stringify({ 
              _id: doc._id,
              formId: doc.formId,
              startDatetime: new Date(doc.startUnixtime).toISOString(),
              startUnixtime: doc.startUnixtime,
              ...flatResponse
            }), 
            'utf8'
          );
          resolve(data)
      })
    }
  }
}

