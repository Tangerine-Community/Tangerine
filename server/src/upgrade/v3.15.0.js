#!/usr/bin/env node
const groupsList = require('/tangerine/server/src/groups-list.js')

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const views = require(`../group-views.js`)
const dbConnection = require('../db')

async function go() {
  console.log('Prepare all groups for new search using update-group-search-index')
  const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
  const groups = (await groupsDb.allDocs({include_docs: true}))
    .rows
    .map(row => row.doc)
  for (const group of groups) {
    const groupId = group._id
    try {
      await exec(`/tangerine/server/src/scripts/update-group-search-index.js ${groupId}`)
      console.log(`search-index updated for group: ${groupId}`)
    } catch (e) {
      console.log(e)
    }
  }
  
  console.log('Updating views with a new view used for Participant Transfers.')
  try {
    await exec(`/tangerine/server/src/scripts/push-all-groups-views.js `)
  } catch (e) {
    console.log(e)
  }
  
}

go()
