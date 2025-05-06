#!/usr/bin/env node

const generateCsvDataSets = require('./generate-csv-data-sets.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-csv-data-sets <filename> [sharedCsvTemplateId]')
  console.log('Examples:')
  console.log(`  generate-csv-data-sets 2022-01-03`)
  console.log(`  generate-csv-data-sets 2022-01-03 shared-csv-template-id`)
  process.exit()
}

const params = {
  filename: process.argv[2],
  sharedCsvTemplateId: process.argv[3] || undefined
}

async function go(params) {
  try {
    await generateCsvDataSets(params.filename, params.sharedCsvTemplateId)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go(params)
