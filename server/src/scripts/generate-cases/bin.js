#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Start by populating a case on your tablet. Then export it in dev tools using the copy(caseService.export()).')
  console.log('Place copied output in a case-export.json file in your group\'s content folder, then run this command.')
  console.log('Usage:')
  console.log('       generate-cases <numberOfCases> <groupId> <fillData>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
const uuidv1 = require('uuid/v1');
const random_name = require('node-random-name');
const numberOfCases = parseInt(process.argv[2])
const groupId = process.argv[3];
const fillData = process.argv[4];
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
    const participant_id = Math.round(Math.random() * 1000000)
    let firstname = random_name({ first: true, gender: "female" })
    let surname = random_name({ last: true })
    let barcode_data =  { "participant_id": participant_id, "treatment_assignment": "Experiment", "bin-mother": "A", "bin-infant": "B", "sub-studies": { "S1": true, "S2": false, "S3": false, "S4": true } }
    let tangerineModifiedOn = new Date();
    // tangerineModifiedOn is set to numberOfCasesCompleted days before today, and its time is set based upon numberOfCasesCompleted.
    tangerineModifiedOn.setDate( tangerineModifiedOn.getDate() - numberOfCasesCompleted );
    tangerineModifiedOn.setTime( tangerineModifiedOn.getTime() - ( numberOfCases - numberOfCasesCompleted ) )
    const day = String(tangerineModifiedOn.getDate()).padStart(2, '0');
    const month = String(tangerineModifiedOn.getMonth() + 1).padStart(2, '0');
    const year = tangerineModifiedOn.getFullYear();
    const screening_date = year + '-' + month + '-' + day;
    const enrollment_date = screening_date;
    let caseMother = {
      _id: caseId,
      tangerineModifiedOn: tangerineModifiedOn,
      "participants": [{
        "id": participant_id,
        "caseRoleId": "mother-role",
        "data": {
          "firstname": firstname,
          "surname": surname,
          "participant_id": participant_id
        }
      }],
    }
    console.log("motherId: " + caseId + " participantId: " + participant_id);
    doc = Object.assign({}, caseDoc, caseMother);

    if (fillData === 'true') {
      caseDoc.items[0].inputs[1].value = participant_id;
      caseDoc.items[0].inputs[2].value = enrollment_date;
      caseDoc.items[0].inputs[8].value = firstname;
      caseDoc.items[0].inputs[10].value = surname;
    }

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
    // modify the demographics form - s01a-participant-information-f254b9
    const demoDoc = templateDocs.find(doc => doc.form.id === 's01a-participant-information-f254b9')
    if (typeof demoDoc !== 'undefined') {
      demoDoc.items[0].inputs[4].value = screening_date;
      // "id": "randomization",
      demoDoc.items[10].inputs[1].value = barcode_data;
      demoDoc.items[10].inputs[2].value = participant_id;
      demoDoc.items[10].inputs[7].value = enrollment_date;
      // "id": "participant_information",
      demoDoc.items[12].inputs[2].value = surname;
      demoDoc.items[12].inputs[3].value = firstname;
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
