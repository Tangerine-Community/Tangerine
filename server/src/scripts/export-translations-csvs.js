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

async function writeTranslationCsv(translationInfo) {
  const keys = Object.keys(translationInfo.csv)
  keys.sort()
  const rows = keys.map(key => [ key, translationInfo.csv[key] ])
  const output = `${rows.map(row => new CSV([row]).encode()).join('\n')}`
  await fs.writeFile(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.csv`, output)
}

async function exportTranslationsCsvs() {
  const translationsInfo = await fs.readJson(`${TRANSLATIONS_PATH}/translations.json`)
  // Populate translation's Json and Csv.
  for (let translationInfo of translationsInfo) {
    translationInfo.json = await fs.readJson(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`)
    translationInfo.csv = {} 
  }
  for (let translationInfo of translationsInfo) {
    for (let translateable of Object.keys(translationInfo.json).sort()) {
      // Make non-translated items blank in CSV output otherwise add the translation.
      translationInfo.csv[translateable] = translationInfo.json[translateable] === translateable
        ? ''
        : translationInfo.json[translateable]
    }
  }
  for (let translationInfo of translationsInfo) {
    await writeTranslationCsv(translationInfo)
  }
}

exportTranslationsCsvs()