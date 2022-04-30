#!/usr/bin/env node
const log = require('tangy-log').log
const reportingWorker = require('../reporting/reporting-worker')
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
  const customConfig = await reportingWorker.getCustomConfig()
  const match = customConfig[module].databases.find(db => db.name === groupId)
  log.debug("match: " + match)
  if (match) {
    customConfig[module].databases.find(db => db.name === groupId).sequence = sequence
    log.debug("Resetting sequence for group " + groupId + " and module " + module + " to" + JSON.stringify(customConfig))
    await reportingWorker.setCustomConfig(customConfig)
  }
  // if (module === 'mysql') {
  //   clearModuleCache(moduleName)
  // } else {
  //   console.log('Unsupported module: ' + moduleName)
  //   process.exit()
  // }
}

go(moduleName, group, sequence)
