const util = require('util');
const axios = require('axios')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const generateCsvDataSet = require('../generate-csv-data-set/generate-csv-data-set');
const groupsList = require('../../groups-list.js');
const writeFile = util.promisify(fs.writeFile);
const log = require('tangy-log').log

const writeState = async function (state) {
  await writeFile(state.statePath, JSON.stringify(state, null, 2))
}

async function getGroupIds(sharedCsvTemplateId) {
  let groupIds = []
  const groups = await groupsList()
  for (const groupId of groups) {
    if (sharedCsvTemplateId) {
      // only include csvs for groups that have the shared csv template
      const url = `${process.env.T_COUCHDB_ENDPOINT}/${groupId}-csv-templates/${sharedCsvTemplateId}`
      try {
        const response = await axios.head(url)
        if (response && response.status == 200) {
          groupIds.push({id: groupId})
        }
      } catch (e) {
        log.warn(`Did not find csv template with id ${sharedCsvTemplateId} in ${groupId}`)
      }
    } else {
      groupIds.push({id: groupId})
    }
  }
  return groupIds
}

async function generateCsvDataSets(filename, sharedCsvTemplateId) {
  const groupIds = await getGroupIds(sharedCsvTemplateId)
  if (groupIds.length == 0) {
    log.error(`No groups found for csv generation for ${filename} ${sharedCsvTemplateId}`)
    return;
  }
  const state = {
    groups: groupIds,
    complete: false,
    startTime: new Date().toISOString(),
    outputPath: `/csv/${filename}.zip`,
    statePath: `/csv/${filename}.json`
  }
  // Fetch all form IDs for each group.
  for (let group of state.groups) {
    group.formIds =  (await fs.readJson(`/tangerine/client/content/groups/${group.id}/forms.json`)).map(
      form => sharedCsvTemplateId ? `${form.id}:${sharedCsvTemplateId}` : form.id
    )
    group.outputPath = `/csv/csv-data-sets-${filename}-${group.id}.zip`
    group.complete = false
  }
  for (let group of state.groups) {
    await writeState(state)
    await generateCsvDataSet(group.id, group.formIds, group.outputPath, '*', '*', false, true, true)
    group.complete = true
    await writeState(state)
  }
  await exec(`zip ${state.outputPath} ${state.groups.map(group => group.outputPath.replace('.json', '.zip')).join(' ')}`)
  state.complete = true
  await writeState(state)
}

module.exports = generateCsvDataSets