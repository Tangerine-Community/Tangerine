#!/usr/bin/env node
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const path = require('path')
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const changeProcessor = require('./data_processing').changeProcessor;
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
    const reportingDb = new DB(`${database.name}-reporting`)
    const changes = await db.changes({ since: database.sequence, limit: state.batchSizePerDatabase, include_docs: false })
    if (changes.results.length > 0) {
      for (let change of changes.results) {
        try {
          await changeProcessor(change, db)
          processed++
        } catch (error) {
          process.stderr.write(`Error on change sequence ${change.seq} with id ${changes.id} - ${error} ::::: `)
        }
      }
      // Even if an error was thrown, continue on with the next sequences.
      database.sequence = changes.results[changes.results.length-1].seq
      // Index the view. It might time out so issue a try statement.:q
      try {
        await reportingDb.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
      } catch (err) {
        // do nothing
      }
    }
  }
  return Object.assign({}, state, {
    tally: state.tally + processed,
    endTime: new Date().toISOString(),
    processed,
    startTime
  })
}

process.stdin.setEncoding('utf8');

var stateJson = ''
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    stateJson += chunk
  }
});

process.stdin.on('end', () => {
  if (stateJson !== '') {
    processBatch(JSON.parse(stateJson))
      .then(state => {
        process.stdout.write(JSON.stringify(state));
        process.exit(0)
      })
      .catch(error => {
        process.stderr.write(`${error}`);
      })
  }
});

