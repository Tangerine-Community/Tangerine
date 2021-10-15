#!/usr/bin/env node

const fs = require('fs-extra')
const DB = require('../db.js')

const updateGroupArchivedIndex = async function (GROUP_ID) {
  const formsInfo = await fs.readJSON(`/tangerine/groups/${GROUP_ID}/client/forms.json`) 
  const db = DB(GROUP_ID)
  const variablesToIndexByFormId = formsInfo.reduce((variablesToIndexByFormId, formInfo) => {
    return formInfo.searchSettings.shouldIndex
      ? {
        ...variablesToIndexByFormId,
        [formInfo.id]: formInfo.searchSettings.variablesToIndex
      }
      : variablesToIndexByFormId
  }, {})

  let map = `function(doc) {
      var variablesToIndexByFormId = ${JSON.stringify(variablesToIndexByFormId)}
      if (
        doc.collection === 'TangyFormResponse' &&
        doc.items &&
        doc.archived &&
        Array.isArray(doc.items) &&
        doc.form &&
        doc.form.id &&
        variablesToIndexByFormId.hasOwnProperty(doc.form.id)
      ) {
        var allInputsValueByName = {}
        doc.items.forEach(function foo(item) {
          item.inputs.forEach(function foo(input) {
            var value = input.value
            if (typeof value === 'string') {
              value = value.toLowerCase()
            }
            allInputsValueByName[input.name] = value
          }, {})
        }, {})
        variablesToIndexByFormId[doc.form.id].forEach(function (variableToIndex) {
          if (allInputsValueByName[variableToIndex]) {
            emit(
              allInputsValueByName[variableToIndex], 
              variableToIndex
            )
          }
        })
      }
    }`
  const updatedArchivedDoc = {
    _id: '_design/archived',
    views: {
      'archived': {
        map
      }
    }
  }
  let existingArchivedDoc = null
  try {
    existingArchivedDoc = await db.get('_design/archived')
    updatedArchivedDoc['_rev'] = existingArchivedDoc._rev
  } 
  catch (e) {
    console.error("Error while fetching archived design doc. Message: " + JSON.stringify(e))
  }
  try {
      if (!existingArchivedDoc || (existingArchivedDoc && existingArchivedDoc.views.archived.map !== updatedArchivedDoc.views.archived.map)) {
      console.log(`Created or updated archived index for group ${GROUP_ID}`)
      await db.put(updatedArchivedDoc)
    }
  } catch (e) {
    console.error("Error while updating (via put) search design doc. Message: " + JSON.stringify(e))
  }
}

/*
 * CLI support
 */
if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js')
  process.exit()
}

if (process.argv[1].includes('update-group-archived-index')) {
  const GROUP_ID = process.argv[2]
  updateGroupArchivedIndex(GROUP_ID)
}

/*
 * Module support
 */
module.exports = { updateGroupArchivedIndex }