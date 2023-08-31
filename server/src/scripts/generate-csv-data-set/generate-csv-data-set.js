const util = require('util');
const spawn = require('child_process').spawn
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const axios = require('axios')
const writeFile = util.promisify(fs.writeFile);
const log = require('tangy-log').log

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
const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify({ ...state, updatedOn: Date.now() }, null, 2))
}
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

function generateCsv(dbName, formId, outputPath, year = '*', month = '*', csvTemplateId) {
  return new Promise(async function(resolve, reject) {
    let csvTemplate
    if (csvTemplateId) {
      const url = `${process.env.T_COUCHDB_ENDPOINT}/${dbName.replace('-reporting', '')}-csv-templates/${csvTemplateId}`
      csvTemplate = (await axios.get(url)).data
    }
    const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
    const sleepTimeBetweenBatches = 0
    let cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${dbName} ${formId} "${outputPath}" ${batchSize} ${sleepTimeBetweenBatches}`
    if (year !== '*' && month !== '*') {
      cmd += ` ${sanitize(year)} ${sanitize(month)}`
    } else {
      cmd += ` '' '' `
    }
    cmd = `${cmd} ${csvTemplate ? `"${csvTemplate.headers.join(',')}"` : ''}`
    log.debug("generate-csv: " + cmd)
    exec(cmd).then(status => {
      resolve(status)
    }).catch(error => {
      log.error("Error when exec-ing generate-csv: " + error)
      reject(error)
    })
  })
}

async function generateCsvDataSet(groupId = '', formIds = [], outputPath = '', year = '*', month = '*', excludePii = false, excludeArchivedForms = false, excludeUserProfileAndReports = false) {
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/ /g, '_')
  const options = {
    replacement: '_'
  }
  let state = {
    dbName: `${groupId}-reporting${excludePii ? '-sanitized' : ''}`,
    formIds,
    outputPath,
    year,
    month,
    excludePii,
    csvs: formIds.map(formId => {
      return {
        formId: formId.includes(':') ? formId.split(':')[0] : formId,
        csvTemplateId: formId.includes(':') ? formId.split(':')[1] :'', 
        inProgress: false,
        complete: false
      }
    }),
    statePath: outputPath.replace('.zip', '.state.json'),
    complete: false,
    startTime: new Date().toISOString()
  }
  await writeState(state)
  for (let csv of state.csvs) {
    const formId = csv.formId
    const forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
    const formInfo = forms.find(formInfo => formInfo.id === formId)

    // Note: `formInfo` will not be set when generating Case Type, Case Event, Event Form and Participants CSVs
    if (excludeArchivedForms && formInfo && formInfo.archived) {
      continue
    }

    if (excludeUserProfileAndReports && (formId == 'reports' || formId == 'user-profile')) {
      continue
    }

    state.csvs.find(csv => csv.formId === formId).inProgress = true
    await writeState(state)
    const formTitle = formInfo
      ? formInfo.title.replace(/ /g, '_')
      : formId
    const groupFormname = sanitize(groupLabel + '-' + formTitle, options)
    const fileName = `${groupFormname}${excludePii ? '-sanitized' : ''}-${Date.now()}.csv`.replace(/'/g, "_")
    const csvOutputPath = `/csv/${fileName.replace(/['",]/g, "_")}`
    const csvStatePath = `${csvOutputPath.replace('.csv', '')}.state.json`
    log.debug("About to generateCsv in generate-csv-data-set.js")
    generateCsv(state.dbName, formId, csvOutputPath, year, month, csv.csvTemplateId)
    while (!await fs.pathExists(csvStatePath)) {
      await sleep(1*1000)
    }
    while (state.csvs.find(csv => csv.formId === formId).complete === false) {
      try {
        const csvState = await fs.readJSON(csvStatePath)
        state.csvs = state.csvs.map(csvInfo => {
          return csvInfo.formId === formId
            ? {
              ...csvInfo,
              ...csvState
            }
            : csvInfo
        })
        await writeState(state)
        if (state.csvs.find(csv => csv.formId === formId).complete === false) {
          await sleep(3*1000)
        }
      } catch (e) {
        // The state file for that CSV was either not yet available or being written.
        await sleep(3*1000)
      }
    }
    state.csvs.find(csv => csv.formId === formId).inProgress = false
    await writeState(state)
  }
  const child = await spawn(`zip`, [outputPath, ...state.csvs.map(csvInfo => csvInfo.outputPath)])
  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`zip process exited with code ${code}`);
        reject()
      }
      resolve()
    })
    child.on('error', (error) => {
      console.log(error)
    })
  })
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSet