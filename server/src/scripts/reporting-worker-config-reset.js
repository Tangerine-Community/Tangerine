#!/usr/bin/env node
const log = require('tangy-log').log
const reportingWorker = require('../reporting/reporting-worker')
const {REPORTING_WORKER_PAUSE, REPORTING_WORKER_RUNNING} = require("../reporting/constants");
const {pathExists} = require("fs-extra");
const {promisify} = require("util");
const writeFile = promisify(require('fs').writeFile)
const unlink = promisify(require('fs').unlink)

if (process.argv[2] === '--help') {
  console.log('Resets sequence for a group and module. ')
  console.log('Usage:')
  console.log('   reporting-worker-reset module group sequence')
  process.exit()
}
const moduleName = process.argv[2]
const group = process.argv[3]
const sequence = process.argv[4]

async function go(module, groupId, sequence) {
  log.debug(`Resetting sequence for group ${groupId} and module ${module} and sequence ${sequence}`)
  log.debug('Pausing reporting working...')
  await writeFile(REPORTING_WORKER_PAUSE, '', 'utf-8')
  log.debug('Waiting for current reporting worker to stop...')
  let reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
  while (reportingWorkerRunning) {
    reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
    if (reportingWorkerRunning) await sleep(1*1000)
  }
  log.debug('OK, reporting worker is stopped. time to reset the sequence.')
  const customConfig = await reportingWorker.getCustomConfig()
  const match = customConfig[module].databases.find(db => db.name === groupId)
  log.debug("match: " + match)
  if (match) {
    customConfig[module].databases.find(db => db.name === groupId).sequence = sequence
    log.debug("Resetting sequence for group " + groupId + " and module " + module + " to" + JSON.stringify(customConfig))
    await reportingWorker.setCustomConfig(customConfig)
  }
  await unlink(REPORTING_WORKER_PAUSE)
  // if (module === 'mysql') {
  //   clearModuleCache(moduleName)
  // } else {
  //   log.debug('Unsupported module: ' + moduleName)
  //   process.exit()
  // }
}

go(moduleName, group, sequence)
