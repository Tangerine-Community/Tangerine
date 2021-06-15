#!/usr/bin/env node

import { extractPiiVariables } from './extract-pii-variables.js'

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  extract-pii-variables <groupId> ')
  console.log('Example:')
  console.log(`  extraxt-pii-variables group-uuid`)
  process.exit()
}

const params = {
  groupId: process.argv[2]
}

if (params.groupId) {
  console.log("Processing group: " + params.groupId)
  extractPiiVariables(params.groupId)
} else {
  console.error("Missing groupId! ")
}
