#!/usr/bin/env node
const PouchDB = require('pouchdb')
const log = require('tangy-log').log
const changeProcessor = require('./data-processing').changeProcessor;
const defaultState = { 
  "tally": 0, 
  "processed": 0,
  "startTime": 0,
  "endTime": 0,
  "batchSizePerDatabase": 5,
  "databases": [],
  "pouchDbDefaults": {
    "prefix": "/tangerine/db/"
  }
}

const processBatch = async () => {
  // Something may have paused the process like clearing cache.
  reportingWorkerPause = await pathExists(REPORTING_WORKER_PAUSE)
  while (reportingWorkerPause) {
    await sleep(REPORTING_WORKER_PAUSE_LENGTH)
    reportingWorkerPause = await pathExists(REPORTING_WORKER_PAUSE)
  }
  // Set semaphore to tell other processes not to mess with the state file.
  await writeFile(REPORTING_WORKER_RUNNING, '', 'utf-8')
  // Now it's safe to get the state.
  workerState = JSON.parse(await readFile(REPORTING_WORKER_STATE, 'utf-8'))
  workerState = Object.assign({} , defaultState, workerState)
  const DB = PouchDB.defaults(state.pouchDbDefaults)
  const startTime = new Date().toISOString()
  let processed = 0
  // Process batch.
  for (let database of workerState.databases) { 
    const db = new DB(database.name)
    const changes = await db.changes({ since: database.sequence, limit: workerState.batchSizePerDatabase, include_docs: false })
    if (changes.results.length > 0) {
      for (let change of changes.results) {
        try {
          await changeProcessor(change, db)
          processed++
        } catch (error) {
          log.error(`Error on change sequence ${change.seq} with id ${changes.id} - ${error} ::::: `)
        }
      }
      // Even if an error was thrown, continue on with the next sequences.
      database.sequence = changes.results[changes.results.length-1].seq
    }
  }
  // Persist state to disk.
  await writeFile(REPORTING_WORKER_STATE, JSON.stringify(workerState), 'utf-8')
  // Remove semaphore.
  try {
    await unlink(REPORTING_WORKER_RUNNING)
  } catch (e) {
    log.error("Unlink error: " + e)
  }
  return 
}

module.exports = processBatch
