#!/usr/bin/env node
const groupsList = require('/tangerine/server/src/groups-list.js')

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const views = require(`../group-views.js`)
const dbConnection = require('../db')

async function go() {
  console.log('Indexing group mango indexes')
  const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
  const groups = (await groupsDb.allDocs({include_docs: true}))
    .rows
    .map(row => row.doc)
  for (const group of groups) {
    const groupId = group._id
    try {
      await exec(`/tangerine/server/src/scripts/generate-indexes/bin.js ${groupId}`)
      console.log(`group views indexed in ${groupId}`)
    } catch (e) {
      console.log(e)
    }
  }
  
  console.log('Adding lastModified to root of each doc in each group.')
  for (let group of groups) {
    const db = new dbConnection(group._id)
    console.log(`updating docs in   ${group._id}`)
    const allDocs = await db.allDocs({include_docs: true});
    for (let record of allDocs.rows) {
      const doc = record.doc
      if (!doc._id.includes('_design')) {
        if (!doc.tangerineModifiedOn) {
          console.log(`updating doc id: ${doc._id}`)
          doc.tangerineModifiedOn = doc.startUnixtime
          try {
            await db.put(doc)
            console.log("doc.tangerineModifiedOn: " + doc.tangerineModifiedOn)
          } catch (e) {
            console.log("e:" + e)
          }
        }
      }
    }
  }
  
}

go()
