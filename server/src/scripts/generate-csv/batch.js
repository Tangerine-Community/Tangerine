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
  const state = JSON.parse(await readFile(params.statePath))
  console.log("state.skip: " + state.skip)
  const docs = await getData(state.dbName, state.formId, state.skip, state.batchSize, state.year, state.month)
  let outputDisabledFieldsToCSV = state.groupConfigurationDoc? state.groupConfigurationDoc["outputDisabledFieldsToCSV"] : false
  console.log("outputDisabledFieldsToCSV: " + outputDisabledFieldsToCSV)
  let csvReplacementCharacters = state.groupConfigurationDoc? state.groupConfigurationDoc["csvReplacementCharacters"] : false
  console.log("csvReplacementCharacters: " + JSON.stringify(csvReplacementCharacters))
  // let csvReplacement = csvReplacementCharacters? JSON.parse(csvReplacementCharacters) : false
  if (docs.length === 0) {
    state.complete = true
  } else {
    // Order each datum's properties by the headers for consistent columns.
    let rows;
    try {
      rows = []
      docs.forEach(doc => {
        let row = [doc._id, ...state.headersKeys.map(header => {
          // Check to see if variable comes from a section that was disabled.
          if (doc.type === 'attendance' && header === 'attendanceList') {
            // skip
          } else if (doc.type === 'scores' && header === 'scoreList') {
            // skip
          } else {
            let value = doc[header];
            console.log("header: " + header + " value: " + value)
            if (typeof value === 'string') {
              if (csvReplacementCharacters) {
                csvReplacementCharacters.forEach(expression => {
                  const search = expression["search"];
                  const replace = expression["replace"];
                  if (search && replace) {
                    const re = new RegExp(search, 'g')
                    try {
                      value = value.replace(re, replace)
                    } catch (e) {
                      console.log("ERROR! re: " + re + " replace: " + replace + " value: " + value + " Error: " + e)
                    }
                  }
                })
              }
            }
            if (typeof header === 'string' && header.split('.').length === 3) {
              console.log("Checking header: " + header + " to see if it is disabled.")
              const itemId = header.split('.')[1]
              if (itemId && doc[`${itemId}_disabled`] === 'true') {
                if (outputDisabledFieldsToCSV) {
                  return value
                } else {
                  return process.env.T_REPORTING_MARK_SKIPPED_WITH
                }
              } else {
                if (value === undefined) {
                  return process.env.T_REPORTING_MARK_UNDEFINED_WITH
                } else {
                  return value
                }
              }
            } else {
              if (value === undefined) {
                return process.env.T_REPORTING_MARK_UNDEFINED_WITH
              } else {
                return value
              }
            }
          }
        })]
        if (doc.type === 'attendance') {
          doc.attendanceList.forEach(attendance => {
            let row = [doc._id, ...state.headersKeys.map(header => {
              let value = attendance[header];
              console.log("header: " + header + " value: " + value)
              return value
            })]
            rows.push(row)
          })
        } else if (doc.type === 'scores') {
          doc.scoreList.forEach(score => {
            let row = [doc._id, ...state.headersKeys.map(header => {
              let value = score[header];
              console.log("header: " + header + " value: " + value)
              return value
            })]
            rows.push(row)
          })
        } else if (doc.type === 'behavior') {
          doc.studentBehaviorList.forEach(behavior => {
            let row = [doc._id, ...state.headersKeys.map(header => {
              let value = behavior[header];
              console.log("header: " + header + " value: " + value)
              return value
            })]
            rows.push(row)
          })
        } else {
          // rows = docs.map(doc => {
          rows.push(row)
        }
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
