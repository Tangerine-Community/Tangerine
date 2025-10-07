#!/usr/bin/env node
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function go() {
  console.log('Updating the translations to include the Myanmar language.')
  try {
    await exec(`/tangerine/server/src/scripts/translations-update.js `)
  } catch (e) {
    console.log(e)
  }
}
go()
