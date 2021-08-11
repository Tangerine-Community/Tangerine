#!/usr/bin/env node
const bootModule = require('../modules/boot-module.js')
if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('   boot-module <moduleName>')
  process.exit()
}
bootModule(process.argv[2])
