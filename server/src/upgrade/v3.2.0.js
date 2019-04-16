#!/usr/bin/env node

const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

async function go() {
  await exec(`translations-update`)
}
go()

