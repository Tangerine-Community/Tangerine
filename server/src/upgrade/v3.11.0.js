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
                  'can_manage_group_deployment',
                  'can_assign_permissions_to_group_user',
                  'can_manage_data',
                  'can_author',
                  'can_configure',
                  'can_deploy',
                  'can_view_form_responses',
                  'can_download_csv',
                  'can_review_issues',
                  'can_review_uploaded_cases'
                ],
              },
              {
                role: 'Member',
                permissions: [
                  'can_manage_data',
                  'can_download_csv'
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

