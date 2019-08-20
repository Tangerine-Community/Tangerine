#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')


async function go() {
  try {
    console.log('Updating translations.')
    await exec(`translations-update`)
    console.log('Updating existing group names that were created before you could have spaces and special characters as a group label.')
    const groupList = await groupsListLegacy()
    for (let groupId of groupList) {
      // Add the custom-sytles.css file to all groups.
      await exec(`touch /tangerine/client/content/groups/${groupId}/custom-styles.css`)
    }
  } catch (error) {
    console.log(error)
  }
}
go()

