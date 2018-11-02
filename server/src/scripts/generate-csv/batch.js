#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('  ./batch.js <statePath> > <outputPath>  ')
  process.exit()
}

const util = require('util');
const axios = require('axios')
const fs = require('fs')
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const CSV = require('comma-separated-values')
const dbDefaults = require('../../db-defaults.js')

const params = {
  statePath: process.argv[2]
}

function getData(dbName, formId, skip, batchSize) {
  const limit = batchSize
  return new Promise((resolve, reject) => {
    try {
      const target = `${dbDefaults.prefix}/${dbName}-reporting/_design/tangy-reporting/_view/resultsByGroupFormId?keys=["${formId}"]&include_docs=true&skip=${skip}&limit=${limit}`
      console.log(target)
      axios.get(target)
        .then(response => {
          resolve(response.data.rows.map(row => row.doc))
        })
        .catch(err => {
          reject(err)
        });
    } catch (err) {
      process.stderr.write(err)
      process.exit(1)
    }
  });
}

async function getRelatedProfileDocs(docs, state) {
  let userProfileDocs = []
  for (let doc of docs) {
    const userProfileIdKey = Object.keys(doc).find(key => key.includes('userProfileId'))
    try {
      let response = await axios.get(`${dbDefaults.prefix}/${state.dbName}-reporting/${doc[userProfileIdKey]}`)
      if (response.data) userProfileDocs.push(response.data)
    } catch (e) {
      // Doesn't exist? Hmm...
    }
  }
  return userProfileDocs
}

async function batch() {
  const state = JSON.parse(await readFile(params.statePath))
  const docs = await getData(state.dbName, state.formId, state.skip, state.batchSize)
  const relatedProfileDocs = await getRelatedProfileDocs(docs, state)
  if (docs.length === 0) {
    state.complete = true
  } else {
    // Order each datum's properties by the headers for consistent columns.
    try {
      const rows = docs.map(doc => {
        const userProfileIdKey = Object.keys(doc).find(key => key.includes('userProfileId'))
        const userProfileId = doc[userProfileIdKey]
        const userProfileDoc = relatedProfileDocs.find(doc => doc._id === userProfileId)
        return [ doc._id, ...state.headersKeys.map(header => {
          if (header.includes('user-profile.') && userProfileDoc) {
            return userProfileDoc[header.replace('user-profile.', '')] ? userProfileDoc[header.replace('user-profile.', '')] : ''
          } else {
            return doc[header] ? doc[header] : ''
          }
        })]
      })
      const output = `\n${new CSV(rows).encode()}`
      await appendFile(state.outputPath, output)
      state.skip = state.skip + state.batchSize
    } catch(err) {
      process.stderr.write(err)
      process.exit(1)
    }
  }
  await writeFile(state.statePath, JSON.stringify(state), 'utf-8')
  process.exit()
}
try {
  batch()
} catch (error) {
  process.stderr.write(error)
  process.exit(1)
}
