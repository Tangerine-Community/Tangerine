#!/usr/bin/env node

const fs = require('fs-extra')
const { emit } = require('process')
const DB = require(`../db.js`)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js')
  process.exit()
}

const GROUP_ID = process.argv[2]

async function go() {
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
        var allInputsValueByName = doc.items.reduce(function foo(allInputsValueByName, item) {
          return Object.assign({},
            allInputsValueByName,
            item.inputs.reduce(function foo(itemInputsValueByName, input) {
              var newEntry = {}
              
              var value = input.value
              if (typeof value === 'string') {
                value = value.toLowerCase()
              }
              newEntry[input.name] = value 
              return Object.assign({},
                itemInputsValueByName,
                newEntry
              )
            }, {})
          )
        }, {})
        Object.getOwnPropertyNames(variablesToIndexByFormId[doc.form.id]).forEach(function (variableToIndex) {
          if (allInputsValueByName[variableToIndex]) {
            emit(
              allInputsValueByName[variableToIndex], 
              variableToIndex
            )
          }
        })
      }
    }`
  const doc = {
    _id: '_design/search',
    views: {
      'search': {
        map
      }
    }
  }
  try {
    const existingSearchDoc = await db.get('_design/search')
    doc['_rev'] = existingSearchDoc._rev
  } catch (e) { }
  try {
    await db.put(doc)

  } catch (e) {
    console.log(e)
  }
}
go()
