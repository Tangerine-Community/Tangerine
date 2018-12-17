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
  // Pause and then wait for the reporting worker to stop running.
  await writeFile(REPORTING_WORKER_PAUSE, '', 'utf-8')
  // Wait for a batch to finish otherwise it will just pick back up again.
  let reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
  while (reportingWorkerRunning) {
    reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
    if (reportingWorkerRunning) await sleep(1*1000)
  }
  // Pause the reporting worker.
  const groupNames = await groupsList()
  await tangyModules.hook('clearReportingCache', { groupNames })
  // update worker state
  const contents = await readFile(REPORTING_WORKER_STATE, 'utf-8')
  const state = JSON.parse(contents)
  const newState = Object.assign({}, state, {
      databases: state.databases.map(({name, sequence}) => { return {name, sequence: 0}})
  })
  await writeFile(REPORTING_WORKER_STATE, JSON.stringify(newState), 'utf-8')
  await unlink(REPORTING_WORKER_PAUSE)
  return newState
}

module.exports = clearReportingCache