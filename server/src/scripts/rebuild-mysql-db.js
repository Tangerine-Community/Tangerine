#!/usr/bin/env node
const rebuildMysqlDb = require('../modules/mysql/rebuild-mysql-db.js')
if (process.argv[2] === '--help') {
  console.log('Clears module cache. Options:')
  console.log('tablenameSuffix: used for testing - if you want to append _test to a tablename for example. ')
  console.log('tableName: To render a particular table only. ')
  console.log('Usage:')
  console.log('   rebuild-mysql-db tablenameSuffix (optional) tableName (optional)')
  process.exit()
}
const tablenameSuffix = process.argv[2]
const tablename = process.argv[3]

async function go() {
  console.log('Started Rebuilding mysql db.')
  await rebuildMysqlDb(tablenameSuffix, tablename)
  console.log('Finished Rebuilding mysql db. ')
  process.exit()
}

go()

