const util = require('util')
const fs = require('fs')
const unlink = util.promisify(fs.unlink)
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const pathExists = require('fs-extra').pathExists
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

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
const { 
  REPORTING_WORKER_PAUSE_LENGTH, 
  REPORTING_WORKER_PAUSE, 
  REPORTING_WORKER_STATE,
  REPORTING_WORKER_RUNNING
} = require('./constants')
const Logger = require('@nestjs/common').Logger;


/*
 * Getter and setters for worker state.
 */

async function getWorkerState() {
  return JSON.parse(await readFile(REPORTING_WORKER_STATE, 'utf-8'))
}

async function setWorkerState(workerState) {
  await writeFile(REPORTING_WORKER_STATE, JSON.stringify(workerState), 'utf-8')
}

/*
 * Working semaphore used for indicating there is work being done.
 */

async function setWorkingFlag() {
  // Set semaphore to tell other processes not to mess with the state file.
  await writeFile(REPORTING_WORKER_RUNNING, '', 'utf-8')
}

async function isWorking() {
  return await pathExists(REPORTING_WORKER_RUNNING)
}

async function unsetWorkingFlag() {
  // Remove semaphore.
  await unlink(REPORTING_WORKER_RUNNING)
}

/*
 * Pause semaphore used to indicate to worker to wait.
 */

async function setPauseFlag() {
  // Set semaphore to tell other processes not to mess with the state file.
  await writeFile(REPORTING_WORKER_RUNNING, '', 'utf-8')
}

async function unsetPauseFlag() {
  // Remove semaphore.
  await unlink(REPORTING_WORKER_RUNNING)
}

async function isPaused() {
  return await pathExists(REPORTING_WORKER_PAUSE)
}

/*
 * Prepare initial worker state on boot.
 */

async function prepare(initialGroups) {
  await setWorkingFlag()
  let workerState = {}
  try {
    workerState = await getWorkerState()
  } catch(err) {
    // do nothing.
  }
  // Populate initial groups if they are not there.
  if (!workerState.databases) workerState.databases = []
  for (let group of initialGroups) {
    let feed = workerState.databases.find(database => database.name === group._id)
    if (!feed) workerState.databases.push({ name: group._id, sequence: 0 })
  }
  // Set database connection.
  workerState.pouchDbDefaults = { prefix: process.env.T_COUCHDB_ENDPOINT }
  // Update worker state.
  await setWorkerState(workerState)
  await unsetWorkingFlag()
  // All done.
  return workerState
}

/*
 * Add a group for the reporting worker to process.
 */
async function addGroup(group) {
  // Bail if this group already exists
  let initialWorkerState = await getWorkerState()
  if (initialWorkerState.databases.find(db => db.name === group._id) || !group._id) {
    return
  }
  log.info(`Add group to reporting worker state: ${group._id}`)
  // Something may have paused the process like clearing cache.
  while (await isPaused()) {
    await sleep(REPORTING_WORKER_PAUSE_LENGTH)
  }
  await setWorkingFlag()
  // Now it's safe to get the state.
  let workerState = await getWorkerState()
  workerState.databases.push({ name: group._id, sequence: 0 })
  await setWorkerState(workerState)
  await unsetWorkingFlag()
  return 
}

/*
 * Run a reporting worker batch.
 */

async function batch() {
  try {
    // Something may have paused the process like clearing cache.
    while (await isPaused()) {
      await sleep(REPORTING_WORKER_PAUSE_LENGTH)
    }
    await setWorkingFlag()
    // Now it's safe to get the state.
    workerState = await getWorkerState()
    workerState = Object.assign({} , defaultState, workerState)
    const DB = PouchDB.defaults(workerState.pouchDbDefaults)
    const startTime = new Date().toISOString()
    let processed = 0
    // Process batch.
    for (let database of workerState.databases) { 
      const db = new DB(database.name)
      const changes = await db.changes({ since: database.sequence, limit: workerState.batchSizePerDatabase, include_docs: false })
      if (changes.results.length > 0) {
        for (let change of changes.results) {
          try {
            // const logger = new Logger("mysql-js reporting-worker changeprocessor");
            // logger.log("say solar.")
            await changeProcessor(change, db)
            processed++
          } catch (error) {
            let errorMessage = JSON.stringify(error)
            let errorMessageText = error.message

            // Sometimes JSON.stringify wipes out the error.
            console.log("typeof error message: " + typeof error.message + " errorMessage: " + errorMessage + " errorMessageText: " + errorMessageText)
            if (typeof error.message === 'object') {
              errorMessageText = JSON.stringify(error.message)
            }
            if (errorMessage === '{}') {
              errorMessage = "Error : " +  " message: " + errorMessageText
            } else {
              errorMessage = "Error : " +  " message: " + errorMessageText + " errorMessage: " + errorMessage
            }
            log.error(`Error on change sequence ${change.seq} with id ${change.id} - Error: ${errorMessage} ::::: `)
          }
        }
        // Even if an error was thrown, continue on with the next sequences.
        database.sequence = changes.results[changes.results.length-1].seq
      }
    }
    // Persist state to disk.
    await setWorkerState(Object.assign({}, workerState, {
      tally: workerState.tally + processed,
      endTime: new Date().toISOString(),
      processed,
      startTime
    }))
    await unsetWorkingFlag()
    return 
  } catch(e) {
    console.error(e)
  }
}

module.exports.getWorkerState = getWorkerState
module.exports.setWorkerState = setWorkerState
module.exports.prepare = prepare
module.exports.addGroup = addGroup
module.exports.batch = batch
module.exports.isWorking = isWorking
module.exports.setWorkingFlag = setWorkingFlag
module.exports.unsetWorkingFlag = unsetWorkingFlag
module.exports.isPaused = isPaused
module.exports.setPauseFlag = setPauseFlag
module.exports.unsetPauseFlag = unsetPauseFlag
