#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[4]) {
  console.log('Usage:')
  console.log('  ./bin.js <groupName> <formId> <outputPath> [batchSize]  ')
  console.log('Example:')
  console.log(`  ./bin.js g2 class-12-lesson-observation-with-pupil-books ./output.csv`)
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
  sleepTimeBetweenBatches: (process.argv[6]) ? parseInt(process.argv[6]) : 0
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
    const db = new DB(`${state.dbName}-reporting`)
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
    // Join user-profile headers.
    if (state.formId !== 'user-profile') {
      try {
        const userProfileHeadersDoc = await db.get('user-profile')
        state.headers = [...state.headers, ...userProfileHeadersDoc.columnHeaders.map(header => `user-profile.${header.header}`)]
        state.headersKeys = [...state.headersKeys, ...userProfileHeadersDoc.columnHeaders.map(header => `user-profile.${header.key}`)]
      } catch(e) {
        // No user-profile form. No worries.
      }
    }
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
    console.error(error)
    process.exit(1)
  }
}
go(state)
