#!/usr/bin/env node

const prewarmViews = require('couchdb-wedge/lib/PreWarmViews.js')
if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       index-all-group-views')
  process.exit()
}

async function go() {
  await prewarmViews({target: process.env.T_COUCHDB_ENDPOINT})
}
go()
