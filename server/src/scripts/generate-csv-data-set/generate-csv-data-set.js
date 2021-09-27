const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const writeFile = util.promisify(fs.writeFile);
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
const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify(state, null, 2))
}
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

function generateCsv(dbName, formId, outputPath, year = '*', month = '*') {
  return new Promise(function(resolve, reject) {
    const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
    const sleepTimeBetweenBatches = 0
    let cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${dbName} ${formId} "${outputPath}" ${batchSize} ${sleepTimeBetweenBatches}`
    if (year !== '*' && month !== '*') {
      cmd += ` ${sanitize(year)} ${sanitize(month)}`
    }
    exec(cmd).then(status => {
      resolve(status)
    }).catch(error => {
      console.error(error)
      reject(error)
    })
  })
}

async function generateCsvDataSet(groupId = '', formIds = [], outputPath = '', year = '*', month = '*', includePii = false) {
  const http = await getUser1HttpInterface()
  const group = (await http.get(`/nest/group/read/${groupId}`)).data
  const groupLabel = group.label.replace(/ /g, '_')
  const options = {
    replacement: '_'
  }
  let state = {
    dbName: `${groupId}-reporting${includePii ? '-sanitized' : ''}`,
    formIds,
    outputPath,
    year,
    month,
    includePii,
    csvs: formIds.map(formId => {
      return {
        formId: formId,
        inProgress: false,
        complete: false
      }
    }),
    statePath: outputPath.replace('.zip', '.state.json'),
    complete: false,
    startTime: new Date().toISOString()
  }
  await writeState(state)
  for (let formId of state.formIds) {
    state.csvs.find(csv => csv.formId === formId).inProgress = true
    await writeState(state)
    const forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
    const formInfo = forms.find(formInfo => formInfo.id === formId)
    const formTitle = formInfo.title.replace(/ /g, '_')
    const groupFormname = sanitize(groupLabel + '-' + formTitle, options)
    const fileName = `${groupFormname}${includePii ? '-sanitized' : ''}-${Date.now()}.csv`.replace(/'/g, "_")
    const csvOutputPath = `/csv/${fileName.replace(/['",]/g, "_")}`
    const csvStatePath = `${csvOutputPath.replace('.csv', '')}.state.json`
    generateCsv(state.dbName, formId, csvOutputPath, year, month)
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
  await exec(`zip ${outputPath} ${state.csvs.map(csvInfo => csvInfo.outputPath).join(' ')}`)
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSet