#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('  ./batch.js <statePath> > <outputPath>  ')
  process.exit()
}

const util = require('util');
const axios = require('axios')
const fs = require('fs-extra')
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const CSV = require('comma-separated-values')
const dbDefaults = require('../../db-defaults.js')

const params = {
  statePath: process.argv[2],
  groupConfigurationDoc: process.argv[3]
}

function getData(dbName, formId, skip, batchSize, year, month) {
  console.log("Getting data in batch.js. dbName: " + dbName + " formId: " + formId)
  const limit = batchSize
  return new Promise((resolve, reject) => {
    try {
      const key = (year && month) ? `${formId}_${year}_${month}` : formId
      const target = `${dbDefaults.prefix}/${dbName}/_design/tangy-reporting/_view/resultsByGroupFormId?keys=["${key}"]&include_docs=true&skip=${skip}&limit=${limit}`
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

async function batch() {
  console.log("in batch.")
  const state = JSON.parse(await readFile(params.statePath))
  console.log("state.skip: " + state.skip)
  const docs = await getData(state.dbName, state.formId, state.skip, state.batchSize, state.year, state.month)
  console.log("docs: " + JSON.stringify(docs))
  let outputDisabledFieldsToCSV = state.groupConfigurationDoc? state.groupConfigurationDoc["outputDisabledFieldsToCSV"] : false
  console.log("outputDisabledFieldsToCSV: " + outputDisabledFieldsToCSV)
  debugger;
  if (docs.length === 0) {
    state.complete = true
  } else {
    // Order each datum's properties by the headers for consistent columns.
    try {
      const rows = docs.map(doc => {
        return [ doc._id, ...state.headersKeys.map(header => {
          // Check to see if variable comes from a section that was disabled.
          if(typeof header === 'string' && header.split('.').length === 3) {
            const itemId = header.split('.')[1]
            if (itemId && doc[`${itemId}_disabled`] === 'true') {
              if (outputDisabledFieldsToCSV) {
                return doc[header]
              } else {
                return process.env.T_REPORTING_MARK_SKIPPED_WITH
              }
            } else {
              if (doc[header] === undefined) {
                  return process.env.T_REPORTING_MARK_UNDEFINED_WITH
              } else {
                  return doc[header]
              }
            }
          } else {
            if (doc[header] === undefined) {
              return process.env.T_REPORTING_MARK_UNDEFINED_WITH
            } else {
                return doc[header]
            }          
          }
        })]
      })
      const output = `\n${rows.map(row => new CSV([row]).encode()).join('\n')}`
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
