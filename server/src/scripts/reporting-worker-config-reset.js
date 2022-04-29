#!/usr/bin/env node
const log = require('tangy-log').log
const reportingWorker = require('../reporting/reporting-worker')
if (process.argv[2] === '--help') {
  console.log('Resets sequence for a group and module. ')
  console.log('Usage:')
  console.log('   reporting-worker-reset module group')
  process.exit()
}
const moduleName = process.argv[2]
const group = process.argv[3]

async function go(module, groupId) {
  log.debug(`Resetting sequence for group ${groupId} and module ${module}`)
  const customConfig = await reportingWorker.getCustomConfig()
  const match = customConfig[module].databases.find(db => db.name === groupId)
  log.debug("match: " + match)
  if (match) {
    customConfig[module].databases.find(db => db.name === groupId).sequence = 0
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

go(moduleName, group)
