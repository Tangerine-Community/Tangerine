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
  },
  "customConfigurations": []
}
const { 
  REPORTING_WORKER_PAUSE_LENGTH, 
  REPORTING_WORKER_PAUSE, 
  REPORTING_WORKER_STATE,
  REPORTING_WORKER_RUNNING, CUSTOM_DATABASE_CONFIGURATION
} = require('./constants')

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
 * Getter and setters for custom database configuration.
 */

async function getCustomConfig() {
  try {
    const file = await readFile(CUSTOM_DATABASE_CONFIGURATION, 'utf-8')
    return JSON.parse(file)
  } catch (e) {
    log.debug(`No custom database configuration found.`)
    return JSON.parse({})
  }
}

async function setCustomConfig(customConfig) {
  await writeFile(CUSTOM_DATABASE_CONFIGURATION, JSON.stringify(customConfig), 'utf-8')
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

async function batch(moduleName) {
  log.debug("Running reporting worker batch for " + moduleName)
  try {
    // Something may have paused the process like clearing cache.
    while (await isPaused()) {
      await sleep(REPORTING_WORKER_PAUSE_LENGTH)
    }
    await setWorkingFlag()
    // Now it's safe to get the state.
    let workerState = await getWorkerState()
    workerState = Object.assign({} , defaultState, workerState)
    const customConfig = await getCustomConfig()
    workerState.customConfigurations = customConfig
    let customConfigurations = workerState.customConfigurations
    const customModuleConfig = customConfigurations[moduleName]
    if (customModuleConfig) {
      log.debug("Custom config for " + moduleName + ": " + JSON.stringify(customModuleConfig))
    } else {
      log.debug("No custom config for " + moduleName)
    }
    const DB = PouchDB.defaults(workerState.pouchDbDefaults)
    const startTime = new Date().toISOString()
    let processed = 0
    // Process batch.
    for (let database of workerState.databases) {
      let dbSequence;
      log.debug("database.name: " + database.name)
      if (customModuleConfig) {
        const customDbConfig = customModuleConfig.databases.find(db => db.name === database.name)
        if (customDbConfig) {
          dbSequence = customDbConfig.sequence
          log.debug("Using custom configuration for " + moduleName + " database " + customDbConfig.name + " sequence " + dbSequence)
        } else {
          log.debug("No customDbConfig for " + moduleName + " database " + database.name)
        }
      } else {
        log.debug("Using default configuration for " + moduleName)
        dbSequence = database.sequence
      }
      const db = new DB(database.name)
      const changes = await db.changes({ since: dbSequence, limit: workerState.batchSizePerDatabase, include_docs: false })
      if (changes.results.length > 0) {
        for (let change of changes.results) {
          try {
            await changeProcessor(change, db, moduleName)
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
    log.debug("workerState.databases: " + JSON.stringify(workerState.databases))
    if (!customConfigurations) {
      customConfigurations = {}
    }
    customConfigurations[moduleName] = {
      databases: workerState.databases
    }
    await setCustomConfig(customConfigurations)
    try {
      await unsetWorkingFlag()
    } catch (e) {
      // log.error(`Error unsetting working flag: ${e}`)
    }
    log.debug(`Reporting worker batch for ${moduleName} complete.`)
    return 
  } catch(e) {
    console.error("Error: " + e)
  }
}

module.exports.getWorkerState = getWorkerState
module.exports.setWorkerState = setWorkerState
module.exports.getCustomConfig = getCustomConfig
module.exports.setCustomConfig = setCustomConfig
module.exports.prepare = prepare
module.exports.addGroup = addGroup
module.exports.batch = batch
module.exports.isWorking = isWorking
module.exports.setWorkingFlag = setWorkingFlag
module.exports.unsetWorkingFlag = unsetWorkingFlag
module.exports.isPaused = isPaused
module.exports.setPauseFlag = setPauseFlag
module.exports.unsetPauseFlag = unsetPauseFlag
