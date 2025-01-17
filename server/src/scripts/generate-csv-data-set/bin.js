#!/usr/bin/env node

const log = require('tangy-log').log
const generateCsvDataSet = require('./generate-csv-data-set.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-csv-data-set <groupId> <formId[,formId]> <outputPath> <fromYear> <froMonth> <toYear> <toMonth> [--exclude-pii] [--excludeArchivedForms] [--excludeUserProfileAndReports]')
  console.log('Examples:')
  console.log(`  generate-csv-data-set group-abdc form1,form2 ./output.csv 2018 4 2019 1 --exclude-pii`)
  console.log(`'Remember Javascript uses 0-based indexing for months) i.e January is 0, February is 1, December is 11 etc.'`)
  console.log(`  generate-csv-data-set group-abdc form1,form2 ./output.csv * * * * --exclude-pii`)
  process.exit()
}

const params = {
  dbName: process.argv[2],
  formIds: process.argv[3].split(','),
  outputPath: process.argv[4],
  fromYear: (process.argv[5]) ? process.argv[5] : null,
  fromMonth: (process.argv[6]) ? process.argv[6] : null,
  toYear: (process.argv[7]) ? process.argv[7] : null,
  toMonth: (process.argv[8]) ? process.argv[8] : null,
  excludePii: process.argv[9] ? true : false,
  excludeArchivedForms: process.argv[10] ? true : false,
  excludeUserProfileAndReports: process.argv[11] ? true : false
}

async function go(params) {
  try {
    log.debug("generateCsvDataSet bin.js")
    await generateCsvDataSet(params.dbName, params.formIds, params.outputPath, params.fromYear, params.fromMonth, params.toYear, params.toMonth, params.excludePii, params.excludeArchivedForms, params.excludeUserProfileAndReports)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go(params)
