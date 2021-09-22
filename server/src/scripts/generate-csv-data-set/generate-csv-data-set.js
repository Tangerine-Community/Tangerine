const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const axios = require('axios')
const writeFile = util.promisify(fs.writeFile);
const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify(state, null, 2))
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
    exec(cmd).then(status => {
      resolve(status)
    }).catch(error => {
      console.error(error)
      reject(error)
    })
  })
}

async function generateCsvDataSet(groupId = '', formIds = [], outputPath = '', year = '*', month = '*', includePii = false) {
  let state = {
    dbName: `${groupId}-reporting${includePii ? '-sanitized' : ''}`,
    formIds,
    outputPath,
    year,
    month,
    includePii,
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
    state.csvs.find(csv => csv.formId === formId).inProgress = true
    await writeState(state)
    const csvOutputPath = `${outputPath.replace('.zip', '')}-${formId}.csv`
    const csvStatePath = `${outputPath.replace('.zip', '')}-${formId}.state.json`
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
  await exec(`zip ${outputPath} ${state.csvs.map(csvInfo => csvInfo.outputPath).join(' ')}`)
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSet