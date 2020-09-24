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
}

go()
