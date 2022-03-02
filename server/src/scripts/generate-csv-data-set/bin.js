#!/usr/bin/env node

const generateCsvDataSet = require('./generate-csv-data-set.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-csv-data-set <groupId> <formId[,formId]> <outputPath> <year> <month> [--exclude-pii]  ')
  console.log('Examples:')
  console.log(`  generate-csv-data-set group-abdc form1,form2 ./output.csv 2018 Jan --exclude-pii`)
  console.log(`  generate-csv-data-set group-abdc form1,form2 ./output.csv * * --exclude-pii`)
  process.exit()
}

const params = {
  dbName: process.argv[2],
  formIds: process.argv[3].split(','),
  outputPath: process.argv[4],
  year: (process.argv[5]) ? process.argv[5] : null,
  month: (process.argv[6]) ? process.argv[6] : null,
  excludePii: process.argv[7] ? true : false
}

async function go(params) {
  try {
    await generateCsvDataSet(params.dbName, params.formIds, params.outputPath, params.year, params.month, params.excludePii) 
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go(params)
