#!/usr/bin/env node

const PouchDB = require('pouchdb')

async function go() {
  try {
    console.log('Migrate group roles to new schema')
    const usersDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/users`)
    const users = (await usersDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .map(doc => {
        return doc.username
          ? {
            ...doc,
            groups: doc.groups.map(group => {
              return {
                groupName: group.groupName, 
                roles: group.role === 'admin' ? ['Admin'] : ['Member']
              }
            })
          }
        : doc
      })
    for (const user of users) {
      await usersDb.put(user)
    }
  } catch (error) {
    console.log(error)
  }
}
go()

