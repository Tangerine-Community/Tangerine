#!/usr/bin/env node
const disableModule = require('../modules/disable-module.js')
if (process.argv[2] === '--help') {
  console.log('Disable a module by name.')
  console.log('Usage:')
  console.log('   disable-module <moduleName>')
  process.exit()
}
disableModule(process.argv[2])
