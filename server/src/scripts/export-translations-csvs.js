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
console.log(TRANSLATIONS_PATH)

async function readCsvAsKeyValueColumns(path) {
  try {
    const data = await fs.readFile(path, { encoding: 'utf8' })
    const csv = {}
    new CSV(data, {cast: [String, String], headers: false}).forEach(function(row) {
      csv[row[0]] = row[1]
    })
    return csv
  } catch (e) {
    // Translation CSV does not exist yet.
    return {}
  }
}

async function writeTranslationJson(translationInfo) {
  await fs.writeFile(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`, JSON.stringify(translationInfo.json, null, 2))
}

async function writeTranslationCsv(translationInfo) {
  try {
    const keys = Object.keys(translationInfo.csv)
    keys.sort()
    const rows = keys.map(key => [ key, translationInfo.csv[key] ])
    const output = `${rows.map(row => new CSV([row]).encode()).join('\n')}`
    await fs.writeFile(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.csv`, output)
  } catch (e) {
    //console.log(translationInfo)
  }
}

async function translationsJsonToCsv() {
  const translationsInfo = await fs.readJson(`${TRANSLATIONS_PATH}/translations.json`)
  // Populate translation's Json and Csv.
  for (let translationInfo of translationsInfo) {
    translationInfo.json = await fs.readJson(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.json`)
    translationInfo.csv = await readCsvAsKeyValueColumns(`${TRANSLATIONS_PATH}/translation.${translationInfo.languageCode}.csv`)
  }
  // Gather up all translateable strings from all translation's JSON and CSV.
  const translateables = []
  for (let translationInfo of translationsInfo) {
    for (let jsonKey of Object.keys(translationInfo.json)) {
      if (!translateables.includes(jsonKey)) {
        translateables.push(jsonKey)
      }
    }
    for (let csvKey of Object.keys(translationInfo.csv)) {
      if (!translateables.includes(csvKey)) {
        translateables.push(csvKey)
      }
    }
  }
  // Hydrate all Translations' CSV and JSON files. 
  for (let translationInfo of translationsInfo) {
    for (let translateable of translateables) {
      if (!translationInfo.json[translateable] && !translationInfo.csv[translateable]) {
        // Add this new translateable to both JSON and CSV.
        translationInfo.csv[translateable] = ''
        // @TODO In the future, it would be nice to leave this blank for ease of finding what needs to be translated. Translate tools would currently interpret that as blanking out the string.
        translationInfo.json[translateable] = translateable
      } else if (!translationInfo.json[translateable] && translationInfo.csv[translateable]) {
        // Migrate the translation in CSV to JSON. 
        translationInfo.json[translateable] = translationInfo.csv[translateable]
      } else if (
        !translationInfo.csv.hasOwnProperty(translateable) &&
        translationInfo.json[translateable] && !translationInfo.csv[translateable] ||
        (
          translateable
        )
      ) {
        // Migrate the translation in JSON to CSV. 
        translationInfo.csv[translateable] = translationInfo.json[translateable]
      }
    }
  }
  await fs.writeFile(`${TRANSLATIONS_PATH}/translations-info.json`, JSON.stringify(translationsInfo, null, 2))
  for (let translationInfo of translationsInfo) {
    await writeTranslationCsv(translationInfo)
    await writeTranslationJson(translationInfo)
  }
}
translationsJsonToCsv()