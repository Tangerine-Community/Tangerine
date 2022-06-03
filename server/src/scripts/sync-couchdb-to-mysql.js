#!/usr/bin/env node
const syncCouchdbToMysql = require('../modules/mysql/sync-couchdb-to-mysql.js')
if (process.argv[2] === '--help') {
  console.log('Catches up to missing or different revs and syncs them..')
  console.log('Usage:')
  console.log('   sync-couchdb-to-mysql tablenameSuffix (optional) ')
  process.exit()
}
const tablenameSuffix = process.argv[2]

async function go() {
  console.log('Started sync of mysql db.')
  await syncCouchdbToMysql(tablenameSuffix)
  console.log('Finished sync of mysql db. ')
  process.exit()
}

go()

