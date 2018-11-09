#!/usr/bin/env node
const PouchDB = require('pouchdb')
const util = require('util')
const fs = require('fs-extra')
const readFile = util.promisify(fs.readFile);
const path = require('path')
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const processBatch = require('../reporting/process-batch.js')

const REPORTING_PAUSE_LENGTH = 5*1000
const REPORTING_WORKER_STATE = '/reporting-worker-state.json'
const REPORTING_WORKER_RUNNING = '/reporting-worker-running'
const REPORTING_WORKER_PAUSED = '/reporting-worker-paused'

async function go() {
  const workerState = JSON.parse(await readFile(REPORTING_WORKER_STATE, 'utf-8'))
  processBatch(workerState)
    .then(state => {
      process.stdout.write(JSON.stringify(state));
      process.exit(0)
    })
    .catch(error => {
      process.stderr.write(`${JSON.stringify(error)}`);
    })
}
go()
