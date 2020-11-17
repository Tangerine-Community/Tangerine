#!/usr/bin/env node

const fs = require('fs-extra')
const DB = require('../db.js')

const updateGroupSearchIndex = async function (GROUP_ID) {
  console.log('')
  console.log(`Updating search index for group ${GROUP_ID}`)
  console.log('')
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
  const updatedSearchDoc = {
    _id: '_design/search',
    views: {
      'search': {
        map
      }
    }
  }
  let existingSearchDoc = null
  try {
    existingSearchDoc = await db.get('_design/search')
    updatedSearchDoc['_rev'] = existingSearchDoc._rev
  } 
  catch (e) {
    console.error(e)
  }
  try {
    if (!existingSearchDoc || (existingSearchDoc && existingSearchDoc.views.search.map !== updatedSearchDoc.views.search.map)) {
      await db.put(updatedSearchDoc)
    }
  } catch (e) {
    console.error(e)
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

if (process.argv[1].includes('update-group-search-index')) {
  const GROUP_ID = process.argv[2]
  updateGroupSearchIndex(GROUP_ID)
}

/*
 * Module support
 */
module.exports = { updateGroupSearchIndex }