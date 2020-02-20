#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')
const fs = require('fs-extra')

async function go() {
  try {
    console.log('Updating translations.')
    await exec(`translations-update`)
    const groupList = await groupsListLegacy()
    for (let groupId of groupList) {
      console.log(`Upgrading group ${groupId}`)
      let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
      try {
        forms = [
          ...forms,
          ...!forms.find(form => form.id === 'user-profile')
            ? [
                {
                  id: 'user-profile',
                  title: 'User Profile',
                  listed: false,
                  src: 'user-profile/form.html',
                }
              ]
            : [],
          ...!forms.find(form => form.id === 'reports')
            ? [
                {
                  id: 'reports',
                  title: 'Reports',
                  listed: false,
                  src: 'reports/form.html',
                }
              ]
            : []
        ]
        await fs.writeJson(`/tangerine/client/content/groups/${groupId}/forms.json`, forms)
      } catch (e) {
        console.log(`Failed to update forms.json for group ${groupId}`)
        console.log(forms)
      }
    }
  } catch (error) {
    console.log(error)
  }
}
go()

