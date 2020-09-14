#!/usr/bin/env node
const groupsList = require('/tangerine/server/src/groups-list.js')

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const PouchDB = require('pouchdb')
const fs = require('fs-extra')
const views = require(`./group-views.js`)
const dbConnection = require('./db')

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
  for (let group of groups) {
    let groupId = group._id
    console.log(`Checking group ${groupId} for needed forms.json fixes from v3.8.0...`)
    let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
    try {
      let hasFormIssues = false
      forms = forms.map(form => {
        if (form.id === 'user-profile' && form.src === 'user-profile/form.html') {
          hasFormIssues = true
          form.src = './assets/user-profile/form.html'
        }
        if (form.id === 'reports' && form.src === 'reports/form.html') {
          hasFormIssues = true
          form.src = './assets/reports/form.html'
        }
        return form
      })
      if (hasFormIssues) {
        await fs.writeJson(`/tangerine/client/content/groups/${groupId}/forms.json`, forms)
      }
    } catch (e) {
      console.log(`Error trying to fix forms.json for ${groupId}`)
    }
  }

  // add only responsesByMonthAndFormId view
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    console.log(`Updating group views for ${groupName} `)
    let groupDb = new dbConnection(groupName)
    const prop = 'responsesByMonthAndFormId'
    const view = views[prop]
    const designDoc = {
      _id: `_design/${prop}`,
      views: {
        [prop]: {
          map: view.toString()
        }
      }
    }
    try {
      const existingDesignDoc = await groupDb.get(`_design/${prop}`)
      designDoc._rev = existingDesignDoc._rev
    } catch (err) {
      // Do nothing... Assume this is the first time the views have been inserted.
    }
    try {
      let status = await groupDb.post(designDoc)
      log.info(`group views inserted into ${groupName}`)
    } catch (error) {
      log.error(error)
    }
  }
}

go()
