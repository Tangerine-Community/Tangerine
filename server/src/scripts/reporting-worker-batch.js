#!/usr/bin/env node
const reportingWorker = require('../reporting/reporting-worker.js')
if (process.argv[2] === '--help') {
  console.log('Starts a batch process and passes the moduleName to the reporting worker')
  console.log('Usage:')
  console.log('   reporting-worker-batch <moduleName>')
  process.exit()
}
async function go(moduleName) {
  console.log("Starting batch process for module: " + moduleName)
  await reportingWorker.batch(moduleName)
}
// console.log("process.argv: " + process.argv)
// console.log("args: " + args)
go(process.argv[2])
