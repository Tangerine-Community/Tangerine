#!/usr/bin/env node

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
                'can_access_releases'
              ]
            }
            : role
        })
      }
    })
  for (const group of groups) {
    await groupsDb.put(group)
  }
}

go()

