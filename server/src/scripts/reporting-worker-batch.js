#!/usr/bin/env node
const log = require('tangy-log').log
const reportingWorker = require('../reporting/reporting-worker.js')
if (process.argv[2] === '--help') {
  console.log('Starts a batch process and passes the moduleName to the reporting worker')
  console.log('Usage:')
  console.log('   reporting-worker-batch <moduleName>')
  process.exit()
}
async function go(moduleName) {
  log.debug("Starting batch process for module: " + moduleName)
  await reportingWorker.batch(moduleName)
}
// log.debug("process.argv: " + process.argv)
// log.debug("args: " + args)
go(process.argv[2])
