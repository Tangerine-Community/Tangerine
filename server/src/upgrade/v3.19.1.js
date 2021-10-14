#!/usr/bin/env node

async function go() {
  console.log('Updating views with a new view used for the Devices listing.')
  try {
    await exec(`/tangerine/server/src/scripts/push-all-groups-views.js `)
  } catch (e) {
    console.log(e)
  }
}
if (process.env['T_MODULES'].includes('sync-protocol-2')) {
  go()
}