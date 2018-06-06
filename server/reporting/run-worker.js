#!/usr/bin/env node
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const path = require('path')
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const changeProcessor = require('./data_processing').changeProcessor;
const defaultState = { 
  "totalChangesProcessed": 0, 
  "lastRunChangesProcessed": 0,
  "lastRunStart": 0,
  "lastRunEnd": 0,
  "batchLimit": 5,
  // @TODO We can only do one doc at a time otherwise form headers will not save and process gets stuck.
  "batchSize": 1,
  "sleepTimeAfterBatch": 0,
  "feeds": [],
  "pouchDbDefaults": {
    "prefix": "/tangerine/db/"
  }
}


const processBatches = (givenState) => {
  return new Promise(async (res, rej) => {

    let state = Object.assign({} , defaultState, givenState)
    const DB = PouchDB.defaults(state.pouchDbDefaults)
    const startTime = new Date().toISOString()
    let shouldProcess = true
    let changesProcessed = 0
    let batchesProcessed = 0

    while (shouldProcess) {


      // Process batch.
      let batchChangesProcessed = 0
      for (let feed of state.feeds) { 
        const db = new DB(feed.dbName)
        const changes = await db.changes({ since: feed.sequence, limit: state.batchSize, include_docs: false })
        if (changes.results.length > 0) {
          try {
            const batch = changes.results.map(change => changeProcessor(change, db))
            let batchResponses = await Promise.all(batch)
          } catch (e) {
            process.stderr.write(`${e}`)
            process.stderr.write(JSON.stringify(e))
          }
          feed.sequence = changes.results[changes.results.length-1].seq
          batchChangesProcessed += changes.results.length
        }
      }

      changesProcessed += batchChangesProcessed 
      batchesProcessed++
      if (batchesProcessed === state.batchLimit) {
        shouldProcess = false
      } else if (batchChangesProcessed > 0) { 
        await sleep(state.sleepTimeAfterBatch)
      }

    }

    res(Object.assign({}, state, {
      totalChangesProcessed: state.totalChangesProcessed + changesProcessed,
      lastRunChangesProcessed: changesProcessed,
      lastRunStart: startTime,
      lastRunEnd: new Date().toISOString()
    }))

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
    processBatches(JSON.parse(stateJson))
      .then(state => {
        process.stdout.write(JSON.stringify(state));
        process.exit(0)
      })
  }
});

