#!/usr/bin/env node
const reportingWorker = require('../reporting/reporting-worker.js')
async function go() {
  await reportingWorker.batch()
}
go()
