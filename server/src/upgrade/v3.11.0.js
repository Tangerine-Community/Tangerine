#!/usr/bin/env node

const PouchDB = require('pouchdb')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

async function go() {
  try {
    console.log('Upgrading groups')

    const groupsDb = new PouchDB(`${process.env['T_COUCHDB_ENDPOINT']}/groups`)
    const groups = (await groupsDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .map(doc => {
        return doc.label
          ? {
            ...doc,
            roles: [
              {
                role: 'Admin',
                permissions: [
                  'can_access_configure',
                    'can_access_security',
                      'can_manage_group_users',
                      'can_manage_group_roles',
                  'can_access_data',
                    'can_access_uploads',
                    'can_access_download_csv',
                    'can_access_cases',
                    'can_access_issues',
                  'can_access_author',
                    'can_access_forms',
                      'can_manage_forms',
                    'can_access_media',
                  'can_access_deploy'
                ],
              },
              {
                role: 'Member',
                permissions: [
                  'can_access_author',
                    'can_access_forms',
                  'can_access_data',
                    'can_access_download_csv'
                ]
              }
            ] 
          }
        : doc
      })
    for (const group of groups) {
      await groupsDb.put(group)
    }
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
    console.log('User schema successfully updated.')
    console.log('Clearing reporting caches.')
    await exec(`reporting-cache-clear`)
  } catch (error) {
    console.log(error)
  }
}
go()

