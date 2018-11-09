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

const processBatch = async (givenState) => {
  let state = Object.assign({} , defaultState, givenState)
  const DB = PouchDB.defaults(state.pouchDbDefaults)
  const startTime = new Date().toISOString()
  let processed = 0
  // Process batch.
  for (let database of state.databases) { 
    const db = new DB(database.name)
    const changes = await db.changes({ since: database.sequence, limit: state.batchSizePerDatabase, include_docs: false })
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
  return Object.assign({}, state, {
    tally: state.tally + processed,
    endTime: new Date().toISOString(),
    processed,
    startTime
  })
}

module.exports = processBatch
