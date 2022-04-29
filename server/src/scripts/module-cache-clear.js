#!/usr/bin/env node
const clearModuleCache = require('../reporting/clear-module-cache')
if (process.argv[2] === '--help') {
  console.log('Clears module cache. Removes all data from the module database. If mysql module, drops any group mysql dbs and .ini files.')
  console.log('Usage:')
  console.log('   module-cache-clear <module-name>')
  console.log('   Currently only supports the mysql module.')
  process.exit()
}
const moduleName = process.argv[2]

async function go() {
  if (moduleName === 'mysql') {
    clearModuleCache(moduleName)
  } else {
    console.log('Unsupported module: ' + moduleName)
    process.exit()
  }
}

go()

