#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[5] || !process.argv[6] || !process.argv[7]) {
  console.log('Usage:')
  console.log('  ./generate-lines.js <dbDefaults> <dbName> <formId> <skip> <limit> <headers>  ')
  process.exit()
}

const CSV = require('comma-separated-values')
const axios = require('axios')
const PouchDB = require('pouchdb')
const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))

const params = {
  dbDefaults: JSON.parse(process.argv[2]),
  dbName: process.argv[3],
  formId: process.argv[4],
  skip: process.argv[5],
  limit: process.argv[6],
  headers: JSON.parse(process.argv[7])
}

function getData(db, formId, skip, limit) {
  return new Promise((resolve, reject) => {
    db.query('tangy-reporting/resultsByGroupFormId', { key: formId, include_docs: true, skip, limit })
      .then(body => resolve(body.rows.map(row => row.doc).map(doc => doc.processedResult)))
      .catch(err => reject(err));
  });
}

async function go(params) {
  const DB = PouchDB.defaults(params.dbDefaults)
  const db = new DB(params.dbName)
  const docs = await getData(db, params.formId, params.skip, params.limit)
  // Order each datum's properties by the headers for consistent columns.
  const rows = docs.map(doc => params.headers.map(header => (doc[header]) ? doc[header] : ''))
  const output = new CSV(rows).encode()
  process.stdout.write(output)  
  process.exit()
}
go(params)
