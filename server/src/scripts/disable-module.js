#!/usr/bin/env node
const clearReportingCache = require('../reporting/clear-reporting-cache')
if (process.argv[2] === '--help') {
  console.log('Clears reporting caches.')
  console.log('Usage:')
  console.log('   reporting-cache-clear')
  process.exit()
}
clearReportingCache()
