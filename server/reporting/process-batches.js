#!/usr/bin/env node
const PouchDbChangesFeedWorker = require('./PouchDbChangesFeedWorker.js').PouchDbChangesFeedWorker
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const path = require('path')
const changeProcessor = require('./data_processing').changeProcessor;

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log(`  echo '[{"dbName": "group1", sequence: 0}]' | ./process-batches.json 5`)
  process.exit(0)
}

// CLI Arguments.
const batchLimit = process.argv[2] ? parseInt(process.argv[2]) : 1

var DB = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  DB = PouchDB.defaults({
    prefix: process.env.T_COUCHDB_ENDPOINT
  });
} else {
  DB = PouchDB.defaults({
    prefix: '/tangerine/db/'
  });
}

const processBatches = (feeds, batchLimit) => {
  return new Promise((res, rej) => {
    let worker = new PouchDbChangesFeedWorker(feeds, changeProcessor, DB, 1, 0, 0, batchLimit)
    worker.on('done', feeds => res(feeds))
    worker.start()
  })
}

process.stdin.setEncoding('utf8');

var feedsJsonIn = ''
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    feedsJsonIn += chunk
  }
});

process.stdin.on('end', () => {
  if (feedsJsonIn !== '') {
    processBatches(JSON.parse(feedsJsonIn), batchLimit)
      .then(feeds => {
        process.stdout.write(JSON.stringify(feeds));
        process.exit(0)
      })
  }
});

