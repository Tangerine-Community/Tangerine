#!/usr/bin/env node

const fs = require('fs-extra')
const groupsList = require('../groups-list.js')
const DB = require('../db.js')

async function updateDownSyncDocCountByLocationId (GROUP_ID) {
  if (GROUP_ID === '*') {
    const groupIds = await groupsList()
    for (let groupId of groupIds) {
      await updateGroup(groupId)
    }
  } else {
    await updateGroup(GROUP_ID)
  }
}

async function updateGroup(GROUP_ID) {
  console.log(`Updating down sync doc count by location index for group ${GROUP_ID}`)
  const formsInfo = await fs.readJSON(`/tangerine/groups/${GROUP_ID}/client/forms.json`) 
  const db = DB(GROUP_ID)
  const formIdsToDownSync = formsInfo.reduce((formIdsToDownSync, formInfo) => {
    return formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled === true && formInfo.couchdbSyncSettings.pull === true
      ? [
        ...formIdsToDownSync,
        formInfo.id
      ]
      : formIdsToDownSync
  }, [])

  let map = `function(doc) {
    var formIdsToDownSync = ${JSON.stringify(formIdsToDownSync)}
    if (
      (
        doc.collection === 'TangyFormResponse' &&
        doc.form &&
        doc.form.id &&
        typeof doc.location === 'object' &&
        formIdsToDownSync.indexOf(doc.form.id) !== -1
      ) ||
      (
        doc.collection === 'Issue' &&
        typeof doc.location === 'object'
      )
    ) {
      Object.getOwnPropertyNames(doc.location).forEach(function(locationLevel) {
        // Emit location's ID and add one.
        emit(doc.location[locationLevel], 1)
      })
    }
  }`
  const updatedDesignDoc = {
    _id: '_design/downSyncDocCountByLocationId',
    views: {
      'downSyncDocCountByLocationId': {
        map,
        reduce: '_sum'
      }
    }
  }
  let existingDesignDoc = null
  try {
    existingDesignDoc = await db.get('_design/downSyncDocCountByLocationId')
    updatedDesignDoc['_rev'] = existingDesignDoc._rev
  } 
  catch (e) {
    // No prob, must be the first time.
  }
  try {
    if (!existingDesignDoc || (existingDesignDoc && existingDesignDoc.views.downSyncDocCountByLocationId.map !== updatedDesignDoc.views.downSyncDocCountByLocationId.map)) {
      await db.put(updatedDesignDoc)
    }
  } catch (e) {
    console.error(e)
  }
}

/*
 * CLI support
 */
if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('update-down-sync-doc-count-by-location-id-index <groupId>')
  console.log('update-down-sync-doc-count-by-location-id-index \'*\'')
  process.exit()
}

if (process.argv[1].includes('update-down-sync-doc-count-by-location-id-index')) {
  const GROUP_ID = process.argv[2]
  updateDownSyncDocCountByLocationId(GROUP_ID)
}

/*
 * Module support
 */
module.exports = { updateDownSyncDocCountByLocationId }