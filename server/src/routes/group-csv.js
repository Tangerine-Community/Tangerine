const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const sanitize = require('sanitize-filename');
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra')
const axios = require('axios')

async function getUser1HttpInterface() {
  const body = await axios.post('http://localhost/login', {
    username: process.env.T_USER1,
    password: process.env.T_USER1_PASSWORD
  })
  const token = body['data']['data']['token']
  let http = axios.create({
    headers: {
      authorization: token
    },
    baseUrl: 'http://localhost'
  })
  return http
}

module.exports = async function (req, res) {
  const groupId = sanitize(req.params.groupId)
  const formId = sanitize(req.params.formId)
  let sanitizedExtension = ''
  if (req.originalUrl.includes('-sanitized')) {
    sanitizedExtension = '-sanitized'
  }
  let dbName = `${groupId}-reporting${sanitizedExtension}`;
  const forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
  const formInfo = forms.find(formInfo => formInfo.id === formId)
  const title = formInfo.title.replace(/ /g, '_')
  // this.group = await this.groupsService.getGroupInfo(groupId);
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/ /g, '_')
  const options = {
    replacement: '_'
  }
  const groupFormname = sanitize(groupLabel + '-' + title, options)
  const fileName = `${groupFormname}${sanitizedExtension}-${Date.now()}.csv`.replace(/'/g, "_")
  let outputPath = `/csv/${fileName.replace(/['",]/g, "_")}`
  const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
  // console.log("req.originalUrl " + req.originalUrl + " outputPath: " + outputPath + " dbName: " + dbName);
    
  const sleepTimeBetweenBatches = 0
  let cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${dbName} ${formId} "${outputPath}" ${batchSize} ${sleepTimeBetweenBatches}`
  if (req.params.year && req.params.month) {
    cmd += ` ${sanitize(req.params.year)} ${sanitize(req.params.month)}`
  }
  log.info(`generating csv start: ${cmd}`)
  exec(cmd).then(status => {
    log.info(`generate csv done: ${JSON.stringify(status)}`)
  }).catch(error => {
    log.error(error)
  })
  res.send({
    stateUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.csv', '.state.json')}`,
    downloadUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  })
}
