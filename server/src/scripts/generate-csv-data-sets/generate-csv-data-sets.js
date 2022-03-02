const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const generateCsvDataSet = require('../generate-csv-data-set/generate-csv-data-set');
const groupsList = require('../../groups-list.js');
const writeFile = util.promisify(fs.writeFile);

const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify(state, null, 2))
}

async function generateCsvDataSets(filename) {
  const groupIds = await groupsList() 
  const state = {
    groups: groupIds.map(groupId => { return { id: groupId } }),
    complete: false,
    startTime: new Date().toISOString(),
    outputPath: `/csv/${filename}.zip`,
    statePath: `/csv/${filename}.json`
  }
  // Fetch all form IDs for each group.
  for (let group of state.groups) {
    group.formIds =  (await fs.readJson(`/tangerine/client/content/groups/${group.id}/forms.json`)).map(form => form.id)
    group.outputPath = `/csv/csv-data-sets-${filename}-${group.id}.zip`
    group.complete = false
  }
  for (let group of state.groups) {
    await writeState(state)
    await generateCsvDataSet(group.id, group.formIds, group.outputPath, '*', '*', false)
    group.complete = true
    await writeState(state)
  }
  await exec(`zip ${state.outputPath} ${state.groups.map(group => group.outputPath.replace('.json', '.zip')).join(' ')}`)
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSets