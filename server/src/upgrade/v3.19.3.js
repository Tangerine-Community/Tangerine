#!/usr/bin/env node
const groupsList = require('/tangerine/server/src/groups-list.js')

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')

async function go() {
  console.log('Prepare all groups for new search using update-group-archived-index')
  const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
  const groups = (await groupsDb.allDocs({include_docs: true}))
    .rows
    .map(row => row.doc)
  for (const group of groups) {
    const groupId = group._id
    try {
      await exec(`/tangerine/server/src/scripts/update-group-archived-index.js ${groupId}`)
      console.log(`archived-index updated for group: ${groupId}`)
    } catch (e) {
      console.log(e)
    }
  }

}

if (process.env['T_MODULES'].includes('sync-protocol-2')) {
  go()
}
