const util = require('util');
const spawn = require('child_process').spawn
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const axios = require('axios');
const jsdom = require("jsdom");
const writeFile = util.promisify(fs.writeFile);
const log = require('tangy-log').log
const { JSDOM } = jsdom;
class NodeJSDOMParser {
  parseFromString(s, contentType = 'text/html') {
    return new JSDOM(s, {contentType}).window.document;
  }
}
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
      try {
        const response = await axios.get(url)
        csvTemplate = response?.data
      } catch (e) {
        log.debug(`Could not find csv template with id ${csvTemplateId}`)
        return 0
      }
    }
    const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
    const sleepTimeBetweenBatches = 0
    let cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${dbName} ${formId} "${outputPath}" ${batchSize} ${sleepTimeBetweenBatches}`
    if (year !== '*' && month !== '*') {
      cmd += ` ${sanitize(year)} ${sanitize(month)}`
    } else {
      cmd += ` '' '' `
    }
    log.debug(`generate-csv ${csvTemplate ? `with headers from ${csvTemplateId}` : ''}: ${cmd}`)
    cmd = `${cmd} ${csvTemplate ? `"${csvTemplate.headers.join(',')}"` : ''}`
    const maxBuffer = 1024 * 1024 * 100;
    exec(cmd, { maxBuffer }).then(status => {
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

  const forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
  for (let csv of state.csvs) {
    const formId = csv.formId
    // Note: `formInfo` will not be set when generating Case Type, Case Event, Event Form and Participants CSVs
    const formInfo = forms.find(formInfo => formInfo.id === formId)

    if (excludeArchivedForms && formInfo && formInfo.archived) {
      state.csvs.find(csv => csv.formId === formId).inProgress = false
      state.csvs.find(csv => csv.formId === formId).complete = true
      await writeState(state)
    } else if (excludeUserProfileAndReports && (formId == 'reports' || formId == 'user-profile')) {
      state.csvs.find(csv => csv.formId === formId).inProgress = false
      state.csvs.find(csv => csv.formId === formId).complete = true
      await writeState(state)
    } else {
      state.csvs.find(csv => csv.formId === formId).inProgress = true
      await writeState(state)
      let formTitle;
      if(!formInfo.title) formTitle = formId;
      if(!formInfo.title.includes('t-lang')) formTitle = formInfo.title.replace(/ /g, '_');
      if(formInfo.title.includes('t-lang')) {
        const titleDomString = new NodeJSDOMParser().parseFromString(formInfo.title, 'text/html')
        const formTitleEnglish = titleDomString.querySelector('t-lang[en]')
        formInfo.title = formTitleEnglish ? formTitleEnglish.textContent : titleDomString.querySelector('t-lang').textContent
        formTitle = formInfo.title.replace(/ /g, '_')
      }
      const groupFormname = sanitize(groupLabel + '-' + formTitle, options)
      const fileName = `${groupFormname}${excludePii ? '-sanitized' : ''}-${Date.now()}.csv`.replace(/'/g, "_")
      const csvOutputPath = `/csv/${fileName.replace(/['",]/g, "_")}`
      const csvStatePath = `${csvOutputPath.replace('.csv', '')}.state.json`
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
  }

  const child = await spawn(`zip`, [outputPath, ...state.csvs.map(csvInfo => csvInfo.outputPath)])
  try {
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
  } catch (e) {
    console.log('zip process threw and error')
  } finally {
    state.complete = true
    await writeState(state)
  }
}

module.exports = generateCsvDataSet