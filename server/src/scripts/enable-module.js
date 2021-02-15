#!/usr/bin/env node
const enableModule = require('../modules/enable-module.js')
if (process.argv[2] === '--help') {
  console.log('Final step to enable some modules, but only after it has been added to T_MODULES in config.sh and start.sh has been run again.')
  console.log('Usage:')
  console.log('   enable-module <moduleName>')
  process.exit()
}
enableModule(process.argv[2])
