#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')

async function go() {
  console.log('Updating translations. On your next group release, Russian translation will be available.')
  await exec(`translations-update`)
  console.log('Updating existing groups that were created before you could have spaces and special characters as a group label.')
  const groupList = await groupsListLegacy()
  for (let groupId of groupList) {
    try {
      await axios.post(`http://${process.env.T_ADMIN}:${process.env.T_PASS}@couchdb:5984/groups`, { _id: groupId, label: groupId })
      console.log(`Setup ${groupId}`)
    } catch (e) {
      console.log(`Failed to setup ${groupId}`)
    }
  }
}
go()

