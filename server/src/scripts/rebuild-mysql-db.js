#!/usr/bin/env node
const rebuildMysqlDb = require('../modules/mysql/rebuild-mysql-db.js')
if (process.argv[2] === '--help') {
  console.log('Clears module cache.')
  console.log('Usage:')
  console.log('   rebuild-mysql-db tablenameSuffix (optional')
  process.exit()
}
const tablenameSuffix = process.argv[2]

async function go() {
  console.log('Started Rebuilding mysql db.')
  await rebuildMysqlDb(tablenameSuffix)
  console.log('Finished Rebuilding mysql db. ')
  process.exit()
}

go()

