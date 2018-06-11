#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[4]) {
  console.log('Usage:')
  console.log('  ./bin.js <dbDefaults> <dbName> <formId> <outputPath> [batchSize]  ')
  console.log('Example:')
  console.log(`  ./bin.js '{"prefix":"http://admin:password@couchdb:5984"}' g2-reporting class-12-lesson-observation-with-pupil-books ./output.csv`)
  process.exit()
}


const CSV = require('comma-separated-values')
const axios = require('axios')
const PouchDB = require('pouchdb')
const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile);

const params = {
  dbDefaults: JSON.parse(process.argv[2]),
  dbName: process.argv[3],
  formId: process.argv[4],
  outputPath: process.argv[5],
  batchSize: (process.argv[6]) ? parseInt(process.argv[6]) : 5
}

let state = Object.assign({}, params, {
  complete: false,
  startTime: new Date().toISOString(),
  skip: 0,
  headersKeys: [],
  totalRows: 0 
})

async function updateStateJson(state) {
  try {
    await writeFile(state.outputPath.replace('.csv', '.state.json'), JSON.stringify({
      complete: state.complete,
      startTime: state.startTime,
      dbName: state.dbName,
      formId: state.formId,
      progress: state.skip,
      total: state.totalRows
    }), 'utf-8')
  } catch (error) {
    console.log(error)
    process.exit()
  }
}

async function go(state) {
  try {
    const DB = PouchDB.defaults(state.dbDefaults)
    const db = new DB(state.dbName)
    const queryInfo = await db.query('tangy-reporting/resultsByGroupFormId', { key: state.formId, include_docs: false, limit: 0 })
    state.totalRows = queryInfo.total_rows
    // Periodically update the status json.
    await updateStateJson(state)
    const updateStateJsonInterval = setInterval(() => updateStateJson(state), 5*1000) 
    // Create the headers.
    const headersDoc = await db.get(state.formId)
    state.headersKeys = headersDoc.columnHeaders.map(header => header.key)
    const headersRow = new CSV([state.headersKeys]).encode()
    await writeFile(state.outputPath, headersRow, 'utf-8')
    //  Run batches.
    let shouldRun = true
    let response = { stdout: '', stderr: '' }
    while (shouldRun) {
      response = await exec(`./generate-lines.js '${JSON.stringify(state.dbDefaults)}' ${state.dbName} ${state.formId} ${state.skip} ${state.batchSize} '${JSON.stringify(state.headersKeys)}' >> ${state.outputPath} && echo '' >> ${state.outputPath}`)
      // Add a new line.
      await exec(`echo '' >> ${state.outputPath}`)
      // Determine next step.
      if (response.stderr) {
        // Will get error when there is nothing left to process.
        shouldRun = false
      } else {
        state.skip += state.batchSize
      }
    }
    clearInterval(updateStateJsonInterval)
    state.complete = true
    await updateStateJson(state)
    process.exit()
  } catch (error) {
    console.log(error)
  }
}
go(state)
