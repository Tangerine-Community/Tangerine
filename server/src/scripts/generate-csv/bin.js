#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-csv <groupName> <formId> <outputPath> [batchSize] <sleepTimeBetweenBatches> <year> <month>`  ')
  console.log('Example:')
  console.log(`  generate-csv g2 class-12-lesson-observation-with-pupil-books ./output.csv`)
  console.log(`  generate-csv g2 class-12-lesson-observation-with-pupil-books ./output.csv 10 5 2018 Jan true`)
  process.exit()
}


const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const CSV = require('comma-separated-values')
const DB = require('../../db.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const params = {
  dbName: process.argv[2],
  formId: process.argv[3],
  outputPath: process.argv[4],
  batchSize: (process.argv[5]) ? parseInt(process.argv[5]) : 5,
  sleepTimeBetweenBatches: (process.argv[6]) ? parseInt(process.argv[6]) : 0,
  year: (process.argv[7]) ? process.argv[7] : null,
  month: (process.argv[8]) ? process.argv[8] : null
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
    console.log(`dbName: ${state.dbName}`)
    const db = new DB(`${state.dbName}`)
    const groupId = state.dbName
      .replace('-reporting-sanitized', '')
      .replace('-reporting', '')
    const groupsDb = new DB(`groups`)
    let groupConfigurationDoc
    try {
      groupConfigurationDoc = await groupsDb.get(groupId)
    } catch (err) {
      console.log('Error: ' + JSON.stringify(err))
      
    }
    // Create the headers.
    let headersDoc = {} 
    try {
      headersDoc = await db.get(state.formId)
    } catch (err) {
      console.log('Nothing to process.')
      await writeFile(state.outputPath, '', 'utf-8')
      await writeFile(state.statePath, JSON.stringify(Object.assign(state, {complete: true})), 'utf-8')
      process.exit()
    }
    state.headers = headersDoc.columnHeaders.map(header => header.header)
    state.headersKeys = headersDoc.columnHeaders.map(header => header.key)
    state.headers.unshift('_id')
    state.groupConfigurationDoc = groupConfigurationDoc
    const headersRow = new CSV([state.headers]).encode()
    await writeFile(state.outputPath, headersRow, 'utf-8')
    // Create initial state for batches.
    await writeFile(state.statePath, JSON.stringify(state), 'utf-8')
    //  Run batches.
    while (state.complete === false) {
      console.log(`Run batch at skip of ${state.skip} at statePath: ${state.statePath}`)
      const response = await exec(`./batch.js '${state.statePath}'`)
      if (response.stderr) console.error(response.stderr)
      if (process.env.NODE_ENV === 'development') console.log(response)
      state = JSON.parse(await readFile(state.statePath))
      await sleep(state.sleepTimeBetweenBatches)
    }
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go(state)
