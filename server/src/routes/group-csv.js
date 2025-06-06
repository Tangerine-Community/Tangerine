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
const generateCsvDataSets = require('../scripts/generate-csv-data-sets/generate-csv-data-sets.js')

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
  const title = formInfo.title.replace(/[&\/\\#,+()$~%.'":*?<>^{}_ ]+/g, '_')
  // this.group = await this.groupsService.getGroupInfo(groupId);
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/[&\/\\#,+()$~%.'":*?<>^{}_ ]+/g, '_')
  const options = {
    replacement: '_'
  }
  const groupFormname = sanitize(groupLabel + '-' + title, options)
  const fileName = `${groupFormname}${sanitizedExtension}-${Date.now()}.csv`.replace(/[&\/\\#,+()$~%.'":*?<>^{}_ ]+/g, '_')
  let outputPath = `/csv/${fileName.replace(/[&\/\\#,+()$~%.'":*?<>^{}_ ]+/g, '_')}`
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
  const {selectedYear, selectedMonth, description} = req.body
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
  const options = {
    replacement: '_'
  }
  const fileName = `${sanitize(groupLabel, options)}-${Date.now()}.zip`.replace(/[&\/\\#,+()$~%'":*?<>^{}_ ]+/g, '_')
  let outputPath = `/csv/${fileName.replace(/[&\/\\#,+()$~%'":*?<>^{}_ ]+/g, '_')}`
  let cmd = `cd /tangerine/server/src/scripts/generate-csv-data-set/ && ./bin.js ${groupId} ${formIds} ${outputPath} ${selectedYear === '*' ? `'*'` : sanitize(selectedYear)} ${selectedMonth === '*' ? `'*'` : sanitize(selectedMonth)} ${req.originalUrl.includes('-sanitized') ? '--sanitized': ''}`
  log.info(`generating csv start: ${cmd}`)
  exec(cmd).then(status => {
    log.info(`generate csv done: ${JSON.stringify(status)} ${outputPath}`)
  }).catch(error => {
    log.error(error)
  })
  const stateUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.zip', '.state.json')}`
  const downloadUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  const csvDataSetInfo = await CSV_DATASETS.post({
    groupId,
    formIds,
    fileName,
    stateUrl,
    downloadUrl,
    description,
    year: selectedYear,
    month: selectedMonth,
    dateCreated: Date.now()
  })
  res.send({
    id: csvDataSetInfo.id,
    stateUrl,
    downloadUrl
  })
}

const generateCSVDataSetsRoute = async (req, res) => {
  const datasetsId = req.params.datasetsId
  const sharedCsvTemplateId = req.params.sharedCsvTemplateId || undefined
  // Do not await, let it run in the background.
  generateCsvDataSets(datasetsId, sharedCsvTemplateId)
  const stateUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${datasetsId}.json`
  const downloadUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${datasetsId}.zip`
  res.send({
    stateUrl,
    downloadUrl
  })
}

const listCSVDataSets = async (req, res) => {
  try {
    const groupId = req.params.groupId
    const pageIndex = parseInt(req.params.pageIndex)
    const pageSize = parseInt(req.params.pageSize) || 5
    await CSV_DATASETS.createIndex({ index: { fields: ['groupId', 'dateCreated'] } })
    // Iterate over the query to find out total number of docs given selector. Note, this was done without paging before but incorrectly always returned 25. Bug never found but paging is better for memory anyways, but ultimately not sure this will scale well, we may have to drop support for knowing the total number of docs.
    let numberOfDatasets = 0
    let moreDatasets = true
    let page = 0
    while (moreDatasets) {
      const result = await CSV_DATASETS.find({ selector: { groupId }, skip: pageSize * page, limit: pageSize })
      numberOfDatasets = numberOfDatasets + result.docs.length
      moreDatasets = result.docs.length > 0 ? true : false
      page++
    }
    const result = await CSV_DATASETS.find({ selector: { groupId }, sort: [{ dateCreated: 'desc' }], skip:pageIndex*pageSize,limit: pageSize })
    const datasets = []
    for (let doc of result.docs) {
      const dataset = await getDataset(doc._id)
      datasets.push(dataset)
    }
    res.send({
      numberOfDatasets,
      datasets
    })
  } catch (error) {
    console.log(error)
  }
}

const getDataset = async (datasetId) => {
  
  const result = await CSV_DATASETS.get(datasetId)
  const http = await getUser1HttpInterface()
  let state = {}
  let complete = false;
  let fileExists = false;
  let stateExists = false
  let excludePii = false
  let stateUrl = encodeURI(result.stateUrl)
  let errorMessage = '' // if error connecting.
  let response
  try {
    response = await http.get(stateUrl)
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Error connecting to server: ' + error.code
      const url = new URL(stateUrl);
      url.hostname = 'localhost';
      url.protocol = 'http'
      url.port = 80
      stateUrl = url.href
      errorMessage = ''
      console.log("Retrying at : " + stateUrl)
      try {
        response = await http.get(stateUrl)
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      }
    }
  }
  if (response) {
    stateExists = true
    complete = response.data.complete
    state = response.data
    // Old state files used to have an includePii property that implied the reverse meaning of what it sounds, was actually excludePii.
    // Find which property this has and set excludePii accordingly.
    excludePii = state.hasOwnProperty('excludePii')
      ? state.excludePii
      : state.hasOwnProperty('includePii')
        ? state.includePii
        : undefined
  }
  
  fileExists = await fs.pathExists(`/csv/${result.fileName}`)
  
  const csvDataSet = {
    id: datasetId,
    state,
    fileExists, 
    stateExists,
    excludePii,
    description: result.description,
    month: result.month,
    year: result.year,
    downloadUrl: result.downloadUrl,
    fileName: result.fileName,
    dateCreated: result.dateCreated,
    baseUrl:`${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}`
  }
  if (csvDataSet.state.complete && csvDataSet.fileExists) {
    csvDataSet.status = 'Available'
  } else if ((csvDataSet.state.complete && !csvDataSet.fileExists) || !csvDataSet.stateExists) {
    csvDataSet.status = 'File removed'
  } else if (
    (!csvDataSet.state.complete && (Date.now() - csvDataSet.state.updatedOn) > (1000 * 60 * 5)) ||
    (!csvDataSet.state.complete && !csvDataSet.state.updatedOn)
  ) {
    csvDataSet.status = 'Stopped'
  } else {
    csvDataSet.status = 'In progress'
  }
  return csvDataSet
}

const getDatasetDetail = async (req, res) => {
  const { datasetId } = req.params
  const dataset = await getDataset(datasetId)
  res.send(dataset)
}

module.exports = {
  generateCSV,
  generateCSVDataSet,
  getDatasetDetail,
  generateCSVDataSetsRoute,
  listCSVDataSets
}