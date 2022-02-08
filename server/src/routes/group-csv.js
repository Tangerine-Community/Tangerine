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
const generateCsvDataSet = require('../scripts/generate-csv-data-set/generate-csv-data-set.js')

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
  const santizeOptions = {
    replacement: '_'
  }
  const http = await getUser1HttpInterface()
  const groupId = sanitize(req.params.groupId)
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const options = {}
  options.groupId = groupId
  options.year = req.body.selectedYear
  options.month = req.body.selectedMonth
  options.description = req.body.description
  options.formIds = req.body.formIds.split(',')
  options.groupLabel = group.label.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
  options.excludePii = req.originalUrl.includes('-sanitized') ? true : false
  options.dateCreated = Date.now()
  options.fileName = `${sanitize(options.groupLabel, santizeOptions)}-${Date.now()}.zip`.replace(/[&\/\\#,+()$~%'":*?<>^{}_ ]+/g, '_'),
  options.outputPath = `/csv/${options.fileName.replace(/[&\/\\#,+()$~%'":*?<>^{}_ ]+/g, '_')}`
  options.stateUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${options.fileName.replace('.zip', '.state.json')}`
  options.downloadUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${options.fileName}`
  log.info(`generating spreadsheet request: ${JSON.stringify(options)}`)
  // Generate CSV Dataset but don't wait, let it run in the background so user can monitor the stateUrl.
  generateCsvDataSet(options.groupId, options.formIds, options.outputPath, options.year, options.month, options.excludePii).then(status => {
    log.info(`generate spreadsheet request done: ${JSON.stringify(status)} ${options.outputPath}`)
  }).catch(error => {
    log.error(error)
  })
  // Save the dataset to the datasets database for reference later.
  const csvDataSetInfo = await CSV_DATASETS.post(options)
  // Return the stateUrl to the user so they can monitor the status of the dataset generation.
  res.send({
    id: csvDataSetInfo.id
  })
}

const generateCSVDataSetsRoute = async (req, res) => {
  const datasetsId = req.params.datasetsId
  // Do not await, let it run in the background.
  generateCsvDataSets(datasetsId)
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
    const pageSize = parseInt(req.params.pageSize)
    CSV_DATASETS.createIndex({ index: { fields: ['groupId', 'dateCreated'] }, limit:987654321 })
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
    const result = await CSV_DATASETS.find({ selector: { groupId }, sort: [{ dateCreated: 'desc' }], skip:(+pageIndex)*(+pageSize),limit:+pageSize })
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
  try {
    response = await http.get(result.stateUrl)
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
    fileExists = await fs.pathExists(`/csv/${result.fileName}`)
  } catch (error) {
    complete = false
    fileExists = false
    stateExists = false
  }
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