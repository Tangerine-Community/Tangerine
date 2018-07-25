#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[4]) {
  console.log('Usage:')
  console.log('  ./bin.js <dbDefaults> <dbName> <formId> <outputPath> [batchSize]  ')
  console.log('Example:')
  console.log(`  ./bin.js '{"prefix":"http://admin:password@couchdb:5984"}' g2-reporting class-12-lesson-observation-with-pupil-books ./output.csv`)
  process.exit()
}

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const CSV = require('comma-separated-values')
const PouchDB = require('pouchdb')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const params = {
  dbDefaults: JSON.parse(process.argv[2]),
  dbName: process.argv[3],
  formId: process.argv[4],
  outputPath: process.argv[5],
  batchSize: (process.argv[6]) ? parseInt(process.argv[6]) : 5,
  sleepTimeBetweenBatches: (process.argv[7]) ? parseInt(process.argv[7]) : 0
}

let state = Object.assign({}, params, {
  statePath: params.outputPath.replace('.csv', '.state.json'),
  complete: false,
  startTime: new Date().toISOString(),
  skip: 0,
  headersKeys: []
})

async function go(state) {
  try {
    const DB = PouchDB.defaults(state.dbDefaults)
    const db = new DB(state.dbName)
    // Create the headers.
    const queryInfo = await db.query('tangy-reporting/resultsByGroupFormId', { key: state.formId, include_docs: false, limit: 0 })
    const headersDoc = await db.get(state.formId)
    state.headers = headersDoc.columnHeaders.map(header => header.header)
    state.headersKeys = headersDoc.columnHeaders.map(header => header.key)
    state.headers.unshift('_id')
    const headersRow = new CSV([state.headers]).encode()
    await writeFile(state.outputPath, headersRow, 'utf-8')
    // Create initial state for batches.
    await writeFile(state.statePath, JSON.stringify(state), 'utf-8')
    //  Run batches.
    while (state.complete === false) {
      console.log(`Run batch at skip of ${state.skip}`)
      await exec(`./batch.js '${state.statePath}'`)
      state = JSON.parse(await readFile(state.statePath))
      await sleep(state.sleepTimeBetweenBatches)
    }
    process.exit()
  } catch (error) {
    console.log(error)
  }
}
go(state)
