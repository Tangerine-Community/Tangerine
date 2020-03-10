#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Start by populating a case on your tablet. Then export it in dev tools using the copy(caseService.export()).
  console.log('Place copied output in a case-export.json file in your group\'s content folder, then run this command.')
  console.log('Usage:')
  console.log('       generate-cases <numberOfCases> <groupId>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
const uuidv1 = require('uuid/v1');
const random_name = require('node-random-name');
const numberOfCases = parseInt(process.argv[2])
const groupId = process.argv[3];
const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)

const templateDocfilename = './template--doc.js'
const templateDoc = require(templateDocfilename).doc
const userProfileTemplateDoc = require('./template-user-profile-doc.js').doc
const groupPath = '/tangerine/client/content/groups/' + groupId

async function go() {
  let numberOfCasesCompleted = 0
  while (numberOfCasesCompleted < numberOfCases) {
    const templateDocs = await fs.readJSON(`${groupPath}/case-export.json`)
    const caseDoc = templateDocs.find(doc => doc.type === 'case')
    // Change the case's ID.
    const caseId = uuidv1()
    caseDoc._id = caseId 
    for (let caseEvent of caseDoc.events) {
      const caseEventId = uuidv1()
      caseEvent.id = caseEventId
      for (let eventForm of caseEvent.eventForms) {
        eventForm.id = uuidv1()
        eventForm.caseId = caseId
        eventForm.caseEventId = caseEventId
        // Some eventForms might not have a corresponding form response.
        if (eventForm.formResponseId) {
          const originalId = `${eventForm.formResponseId}`
          const newId = uuidv1()
          // Replace originalId with newId in both the reference to the FormResponse doc and the FormResponse doc itself.
          eventForm.formResponseId = newId
          const formResponse = templateDocs.find(doc => doc._id === originalId)
          if (!formResponse) {
            debugger
          }
          formResponse._id = newId
        }
      }
    }
    // Upload the profiles first
    // now upload the others
    for (let doc of templateDocs) {
      try {
        delete doc._rev
        await db.put(doc)
      } catch (e) {
        debugger
      }
    }
    numberOfCasesCompleted++
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
