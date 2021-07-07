const util = require('util');
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile);
const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify(state, null, 2))
}
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

async function generateCsvDataSet(dbName = '', formIds = [], outputPath = '', year = '', month = '', includePii = false) {
  let state = {
    dbName,
    formIds,
    outputPath,
    year,
    month,
    includePii,
    csvs: formIds.map(formId => {
      return {
        formId: formId,
        inProgress: false,
        complete: false,
        rows: 0
      }
    }),
    statePath: outputPath.replace('.zip', '.state.json'),
    complete: false,
    startTime: new Date().toISOString()
  }
  await writeState(state)
  for (let formId of state.formIds) {
    let complete = false
    state.csvs.find(csv => csv.formId === formId).inProgress = false
    await writeState(state)
    while (complete === false) {
      complete = true
    }
    state.csvs.find(csv => csv.formId === formId).complete = true
    state.csvs.find(csv => csv.formId === formId).inProgress = false
    await writeState(state)
    await sleep(10*1000)
  }
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSet