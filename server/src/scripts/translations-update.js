#!/usr/bin/env node

const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       translations-update')
  process.exit()
}

async function go() {
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    await exec(`cp /tangerine/content-sets/default/client/translation* /tangerine/groups/${groupName}/client/`)  }
}
go()
