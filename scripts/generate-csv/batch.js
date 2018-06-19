#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('  ./batch.js <statePath> > <outputPath>  ')
  process.exit()
}

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const CSV = require('comma-separated-values')
const PouchDB = require('pouchdb')

const params = {
  statePath: process.argv[2]
}

function getData(db, formId, skip, batchSize) {
  // Off by one error???
  const limit = batchSize + 1
  return new Promise((resolve, reject) => {
    db.query('tangy-reporting/resultsByGroupFormId', { key: formId, include_docs: true, skip, limit })
      .then(body => resolve(body.rows.map(row => row.doc).map(doc => doc.processedResult)))
      .catch(err => reject(err));
  });
}

async function batch() {
  const state = JSON.parse(await readFile(params.statePath))
  const DB = PouchDB.defaults(state.dbDefaults)
  const db = new DB(state.dbName)
  const docs = await getData(db, state.formId, state.skip, state.batchSize)
  if (docs.length === 0) {
    state.complete = true
  } else {
    // Order each datum's properties by the headers for consistent columns.
    const rows = docs.map(doc => state.headersKeys.map(header => (doc[header]) ? doc[header] : ''))
    const output = new CSV(rows).encode()
    await appendFile(state.outputPath, output)
    // Off by one error???
    state.skip += state.batchSize
  }
  await writeFile(state.statePath, JSON.stringify(state), 'utf-8')
  process.exit()
}
batch()
