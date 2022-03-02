#!/usr/bin/env node

const generateCsvDataSets = require('./generate-csv-data-sets.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-csv-data-sets <filename>')
  console.log('Examples:')
  console.log(`  generate-csv-data-sets 2022-01-03`)
  process.exit()
}

const params = {
  filename: process.argv[2]
}

async function go(params) {
  try {
    await generateCsvDataSets(params.filename) 
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go(params)
