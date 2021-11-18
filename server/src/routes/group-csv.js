const DB = require('../db.js')
const CSV_DATASETS = new DB('csv_datasets')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const sanitize = require('sanitize-filename');
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra')
const axios = require('axios')
const tangyModules = require('../modules/index.js')()

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

const generateCSV = async (req, res) => {
  const groupId = sanitize(req.params.groupId)
  const formId = sanitize(req.params.formId)
  let sanitizedExtension = ''
  if (req.originalUrl.includes('-sanitized')) {
    sanitizedExtension = '-sanitized'
  }
  let dbName = `${groupId}-reporting${sanitizedExtension}`;
  let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
  if(tangyModules.enabledModules.includes('case')){
    const appendedForms = [
      {id: 'participant',title:'Participant'},
      {id: 'event-form',title:'Event Form'},
      {id: 'case-event',title: 'Case Event'}];
      forms = [...forms, ...appendedForms]
  }
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

const generateCSVDataSet = async (req, res) => {
  const groupId = sanitize(req.params.groupId)
  // A list of formIds will be too long for sanitize's limit of 256 bytes so we split, map with sanitize, and join.
  const formIds = req.body.formIds.split(',').map(formId => formId).join(',')
  const {selectedYear:year, selectedMonth:month, description} = req.body
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/ /g, '_')
  const options = {
    replacement: '_'
  }
  const fileName = `${sanitize(groupLabel, options)}-${Date.now()}.zip`.replace(/'/g, "_")
  let outputPath = `/csv/${fileName.replace(/['",]/g, "_")}`
  let cmd = `cd /tangerine/server/src/scripts/generate-csv-data-set/ && ./bin.js ${groupId} ${formIds} ${outputPath} ${year ? sanitize(year) : `'*'`} ${month ? sanitize(month) : `'*'`} ${req.originalUrl.includes('-sanitized') ? '--sanitized': ''}`
  log.info(`generating csv start: ${cmd}`)
  exec(cmd).then(status => {
    log.info(`generate csv done: ${JSON.stringify(status)}`)
  }).catch(error => {
    log.error(error)
  })
  const stateUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.zip', '.state.json')}`
  const downloadUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  await CSV_DATASETS.post({
    groupId,
    formIds,
    fileName,
    stateUrl,
    downloadUrl,
    description,
    year,
    month,
    dateCreated: Date.now()
  })
  res.send({
    stateUrl,
    downloadUrl
  })
}

const listCSVDataSets = async (req, res) => {
  try {
    const { groupId, pageIndex, pageSize } = req.params
    CSV_DATASETS.createIndex({ index: { fields: ['groupId', 'dateCreated'] } })
    const numberOfDocs = (await CSV_DATASETS.find({ selector: { groupId } })).docs.length
    const result = await CSV_DATASETS.find({ selector: { groupId }, sort: [{ dateCreated: 'desc' }], skip:(+pageIndex)*(+pageSize),limit:+pageSize })
    const http = await getUser1HttpInterface()
    const data = result.docs.map(async e => {
      let complete = false;
      let fileExists = false;
      try {
        complete = (await http.get(e.stateUrl)).data.complete
        fileExists = await fs.pathExists(`/csv/${e.fileName}`)
      } catch (error) {
        complete = false
        fileExists = false
      }
      return ({ ...e, complete, fileExists, numberOfDocs })
    })
    res.send(await Promise.all(data))
  } catch (error) {
    console.log(error)
  }
}

const getDatasetDetail = async (req, res) => {
  const { datasetId } = req.params
  const result = await CSV_DATASETS.get(datasetId)
  const http = await getUser1HttpInterface()
  res.send({
     ...(await http.get(result.stateUrl)).data, 
     month: result.month,
     year: result.year,
     downloadUrl: result.downloadUrl,
     fileName: result.fileName,
     dateCreated: result.dateCreated,
     baseUrl:`${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}`
  })

}
module.exports = {
  generateCSV,
  generateCSVDataSet,
  getDatasetDetail,
  listCSVDataSets
}