#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('')
  console.log('Usage:')
  console.log('       generate-location-level-indexes <groupId>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const groupId = process.argv[2];
const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)
const groupPath = '/tangerine/client/content/groups/' + groupId

async function go() {
  const locationList = await fs.readJSON(`${groupPath}/location-list.json`)
  console.log(`Generating index for: ${locationList.locationsLevels.join(', ')}`)
  for (const level of locationList.locationsLevels) {
    await db.createIndex({
      index: {
        fields: [
          'type',
          `location.${level}`
        ]
      }
    })
    let indexDidIndex = true
    try {
      // Trigger the index to be indexed.
      await db.find({
        selector: {
          type: '',
          [`location.${level}`]: ''
        },
        limit: 1
      })
    } catch (e) {
      // This will likely timeout, no problem.
      indexDidIndex = false
    }
    console.log(indexDidIndex
      ? `Index for group ${groupId} with level ${level} created.`
      : `Index for group ${groupId} with level ${level} will continue to process in the background. Check the Active Tasks in CouchDB for when the index has finished building.`
    )
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
