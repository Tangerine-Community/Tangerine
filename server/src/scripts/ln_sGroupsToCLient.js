//generate-csv-data-set.js 
//const maxBuffer = 1024 * 1024 * 100;
	      exec(cmd, { maxBuffer }).then(status => {


//bin.js
	// const maxBuffer = 1024 * 1024 * 100; // 100MB

      const response = await exec(`./batch.js '${state.statePath}'`, { maxBuffer });



#!/usr/bin/env node
const groupsList = require('/tangerine/server/src/groups-list.js')

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const views = require(`../group-views.js`)
const dbConnection = require('../db')

async function go() {
  console.log('Upgrading groups Admin roles with new permissions...')
  const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
  const groups = (await groupsDb.allDocs({include_docs: true}))
    .rows
    .map(row => row.doc)
    .map(doc => {
      return {
        ...doc,
        roles: doc.roles.map(role => {
          return role.role === 'Admin'
            ? {
              ...role,
              permissions: [
                ...role.permissions,
                'can_access_devices',
                'can_access_device_users',
                'can_access_releases',
                'can_access_configure_sync',
                'can_access_configure_location_list'
              ]
            }
            : role
        })
      }
    })
  for (const group of groups) {
    await groupsDb.put(group)
    const groupId = group._id
    try {
      
      await exec(`ln -s /tangerine/groups/${groupId}/client /tangerine/client/content/groups/${groupId}`)
    } catch (e) {
      console.log(e)
    }
  }
 
}

go()




