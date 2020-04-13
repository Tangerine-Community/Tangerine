#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')
const fs = require('fs-extra')
const PouchDB = require('pouchdb')

async function go() {
  try {
    if (process.env['T_MODULES'].includes('sync-protocol-2')) {
      console.log('Removing expired sync sessions.')
      const _usersDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/_users`)
      const expiredSyncSessions = (await _usersDb.allDocs({ include_docs: true }))
        .rows
        .map(row => row.doc)
        .filter(userDoc => userDoc._id.includes('org.couchdb.user:syncUser'))
      for (const expiredSyncSession of expiredSyncSessions) {
        await _usersDb.remove(expiredSyncSession)
      }
    }
    const groupList = await groupsListLegacy()
    console.log('Creating database indexes in all groups. This command will complete quickly but check Active Tasks in CouchDB Fauxton for when it actually finishes.')
    for (let groupId of groupList) {
      console.log(`generate-location-level-indexes ${groupId}`)
      await exec(`generate-location-level-indexes ${groupId}`)
      console.log( )
      if (process.env['T_MODULES'].includes('sync-protocol-2')) {
        let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
        // Disable custom push in favor of couchdb push.
        forms = forms.map(form => {
          return {
            ...form,
            customSyncSettings: {
              enabled: false,
              push: false,
              pull: false,
              excludeIncomplete:false
            },
            couchdbSyncSettings: {
              enabled: true,
              push: true,
              pull: form.couchdbSyncSettings && form.couchdbSyncSettings.pull ? true : false,
              filterByLocation: true 
            }
          }
        })
        await fs.writeJson(`/tangerine/client/content/groups/${groupId}/forms.json`, forms)
      }
    }
  } catch (error) {
    console.log(error)
  }
}
go()

