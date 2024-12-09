#!/usr/bin/env node
const pathExists = require('fs-extra').pathExists
const promisify = require('util').promisify
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const unlink = promisify(require('fs').unlink)
const groupsList = require('../groups-list.js')
const tangyModules = require('../modules/index.js')()
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

const { 
  REPORTING_WORKER_PAUSE, 
  REPORTING_WORKER_STATE,
  REPORTING_WORKER_RUNNING
} = require('./constants')

async function clearReportingCache() {
  console.log('Pausing reporting working...')
  await writeFile(REPORTING_WORKER_PAUSE, '', 'utf-8')
  console.log('Waiting for current reporting worker to stop...')
  let reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
  while (reportingWorkerRunning) {
    reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
    if (reportingWorkerRunning) await sleep(1*1000)
  }
  console.log('Clearing reporting caches...')
  let groupNames = await groupsList()

  let onlyProcessTheseGroups = []
  if (process.env.T_ONLY_PROCESS_THESE_GROUPS && process.env.T_ONLY_PROCESS_THESE_GROUPS !== '') {
    onlyProcessTheseGroups = process.env.T_ONLY_PROCESS_THESE_GROUPS
      ? JSON.parse(process.env.T_ONLY_PROCESS_THESE_GROUPS.replace(/\'/g, `"`))
      : []
  }
  if (onlyProcessTheseGroups.length > 0) {
    groupNames = groupNames.filter(groupName => onlyProcessTheseGroups.includes(groupName))
  }

  // run the module clearReportingCache hooks
  await tangyModules.hook('clearReportingCache', { groupNames })

  // update worker state
  debugger;
  console.log('Resetting reporting worker state...')
  const contents = await readFile(REPORTING_WORKER_STATE, 'utf-8')
  const state = JSON.parse(contents)
  const newState = Object.assign({}, state, {
    databases: state.databases.map(
      ({name, sequence}) => 
        {
          if (groupNames.length == 0 || groupNames.includes(name)) {
            return {name, sequence: 0}
          } else {
            return {name, sequence}
          }
        }
    )
  })
  await writeFile(REPORTING_WORKER_STATE, JSON.stringify(newState), 'utf-8')
  await unlink(REPORTING_WORKER_PAUSE)
  console.log('Done!')
  return newState
}

module.exports = clearReportingCache