#!/usr/bin/env node
const pathExists = require('fs-extra').pathExists
const promisify = require('util').promisify
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const unlink = promisify(require('fs').unlink)
const groupsList = require('../groups-list.js')
const tangyModules = require('../modules/index.js')()
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

const util = require('util');
const exec = util.promisify(require('child_process').exec)

const { 
  REPORTING_WORKER_PAUSE, 
  REPORTING_WORKER_STATE,
  REPORTING_WORKER_RUNNING
} = require('./constants')
const fs = require("fs-extra");


async function clearReportingCache() {
  console.log('Pausing reporting working...')
  await writeFile(REPORTING_WORKER_PAUSE, '', 'utf-8')
  console.log('Waiting for current reporting worker to stop...')
  let reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
  while (reportingWorkerRunning) {
    reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
    if (reportingWorkerRunning) await sleep(1*1000)
  }

  await unlink(REPORTING_WORKER_PAUSE)
  console.log('Reporting caches cleared.')
}

module.exports = clearReportingCache