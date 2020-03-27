#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('')
  console.log('Usage:')
  console.log('       generate-location-level-indexes <groupId>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
const groupId = process.argv[2];
const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)
const groupPath = '/tangerine/client/content/groups/' + groupId

async function go() {
  const locationList = await fs.readJSON(`${groupPath}/location-list.json`)
  for (const level in locationList.levels) {
    db.createIndex({
      index: {
        fields: [
          'type',
          `location.${level}`
        ]
      }
    })
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
