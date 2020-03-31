#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')
const fs = require('fs-extra')

async function go() {
  try {
    const groupList = await groupsListLegacy()
    console.log('Creating database indexes in all groups. This command will complete quickly but check Active Tasks in CouchDB Fauxton for when it actually finishes.')
    for (let groupId of groupList) {
      console.log(`generate-location-level-indexes ${groupId}`)
      await exec(`generate-location-level-indexes ${groupId}`)
    }
  } catch (error) {
    console.log(error)
  }
}
go()

