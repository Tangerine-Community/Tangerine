#!/usr/bin/env node
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function go() {
  console.log('Updating views with a new view used for the User Profile listing.')
  try {
    await exec(`/tangerine/server/src/scripts/push-all-groups-views.js `)
  } catch (e) {
    console.log(e)
  }
}
go()
