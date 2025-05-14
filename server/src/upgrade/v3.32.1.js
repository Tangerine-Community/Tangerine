#!/usr/bin/env node
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function go() {
  console.log('Updating the user short code length to the config value T_USER_SHORT_CODE_LENGTH.')
  try {
    await exec(`/tangerine/server/src/scripts/push-all-groups-views.js `)
  } catch (e) {
    console.log(e)
  }
}
go()
