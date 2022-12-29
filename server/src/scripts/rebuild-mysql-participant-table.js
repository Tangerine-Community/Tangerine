#!/usr/bin/env node
const rebuildParticipantTable = require('../modules/mysql/rebuild-mysql-participant-table.js')
if (process.argv[2] === '--help') {
  console.log('Rebuilds participant table.')
  console.log('Usage:')
  console.log('   rebuild-mysql-participant-table.js tablenameSuffix (optional')
  process.exit()
}
const tablenameSuffix = process.argv[2]

async function go() {
  console.log('Started Rebuilding participant table.')
  await rebuildParticipantTable(tablenameSuffix)
  console.log('Finished Rebuilding participant table')
  process.exit()
}

go()