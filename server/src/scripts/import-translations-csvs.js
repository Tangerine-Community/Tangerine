#!/usr/bin/env node
if (process.argv[2] === '--help') {
  console.log('Clears reporting caches.')
  console.log('Usage:')
  console.log('   reporting-cache-clear')
  process.exit()
}

const fs =  require('fs-extra')
const CSV = require('comma-separated-values')

const TRANSLATIONS_PATH = __dirname + '/../../../translations'

async function readCsvAsKeyValueColumns(path) {
  try {
    const data = await fs.readFile(path, { encoding: 'utf8' })
    const csv = {}
    // Allow for extra columns, because when using cast to string, you need to be exact on the number of columns.
    let cast = []
    new CSV(data, { headers: false}).forEach(function(row) {
      cast = row.map(column => String)
    })
    // Now actually parse the CSV down to the CSV array.
    new CSV(data, {cast, headers: false}).forEach(function(row) {
      csv[row[0]] = row[1]
    })
    return csv
  } catch (e) {
    // Translation CSV does not exist yet.
    return {}
  }
}

async function importTranslationsCsvs() {
  const translationsInfo = await fs.readJson(`${TRANSLATIONS_PATH}/translations.json`)
  for (let translationInfo of translationsInfo) {
    translationInfo.json = await fs.readJson(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`)
    translationInfo.csv = await readCsvAsKeyValueColumns(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.csv`)
  }
  for (let translationInfo of translationsInfo) {
    for (let translateable of Object.keys(translationInfo.csv)) {
      // If the translation in CSV is blank, fall back first to what we have in JSON, then fall back to using the translateable as the translation.
      translationInfo.json[translateable] = translationInfo.csv[translateable] === ''
        ? translationInfo.json[translateable] || translateable
        : translationInfo.csv[translateable]
    }
  }
  for (let translationInfo of translationsInfo) {
    await fs.writeFile(
      `${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`, 
      JSON.stringify(translationInfo.json, Object.keys(translationInfo.json).sort(), 2)
    )
  }
}

importTranslationsCsvs()