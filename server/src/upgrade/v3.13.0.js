#!/usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')
async function go() {
  console.log('Upgrading groups Admin roles with new permissions...')
  const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
  const groups = (await groupsDb.allDocs({ include_docs: true }))
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
      await exec(`mkdir /tangerine/groups/${groupId}/`)
      await exec(`mv /tangerine/client/content/groups/${groupId} /tangerine/groups/${groupId}/client`)
      await exec(`mkdir /tangerine/groups/${groupId}/editor`)
      // @TODO Create a symlink to the old group client directory until all the other APIs are updated and we have 
      // a proper upgrade script to migrate group directories.
      await exec(`ln -s /tangerine/groups/${groupId}/client /tangerine/client/content/groups/${groupId}`)
    } catch (e) {
      console.log(e)
    }

  }
}

go()

