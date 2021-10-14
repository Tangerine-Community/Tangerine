#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('This command ensures consistency in translateables between translation files. If a translateable was added in one file, it will now exist in all other files for translating.')
  console.log('Usage:')
  console.log('   make-translations-consistent')
  process.exit()
}

const fs =  require('fs-extra')

const TRANSLATIONS_PATH = __dirname + '/../../../translations'

async function translationsJsonToCsv() {
  const translationsInfo = await fs.readJson(`${TRANSLATIONS_PATH}/translations.json`)
  // Get translation JSON. 
  for (let translationInfo of translationsInfo) {
    translationInfo.json = await fs.readJson(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`)
  }
  // Gather up all translateable strings.
  const translateables = []
  for (let translationInfo of translationsInfo) {
    for (let jsonKey of Object.keys(translationInfo.json)) {
      if (!translateables.includes(jsonKey)) {
        translateables.push(jsonKey)
      }
    }
  }
  // Ensure all translateables are in all JSON files.
  for (let translationInfo of translationsInfo) {
    for (let translateable of translateables) {
      if (!translationInfo.json.hasOwnProperty(translateable)) {
        translationInfo.json[translateable] = translateable
      }
    }
  }
  // For debugging.
  // await fs.writeFile(`${TRANSLATIONS_PATH}/translations-info.json`, JSON.stringify(translationsInfo, null, 2))
  // Write the traslation JSON files.
  for (let translationInfo of translationsInfo) {
    await fs.writeFile(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`, JSON.stringify(translationInfo.json, Object.keys(translationInfo.json).sort(), 2))
  }
}
translationsJsonToCsv()