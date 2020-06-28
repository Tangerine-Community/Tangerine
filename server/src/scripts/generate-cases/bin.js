#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Start by populating a case on your tablet. Then export it in dev tools using the copy(caseService.export()).')
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
const groupDevicesDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}-devices`)
const templateDocfilename = './template--doc.js'
const templateDoc = require(templateDocfilename).doc
const userProfileTemplateDoc = require('./template-user-profile-doc.js').doc
const groupPath = '/tangerine/client/content/groups/' + groupId
const {customGenerators, customSubstitutions} = require(`${groupPath}/custom-generators.js`)

async function setLocation(groupId) {
  // Get a Device to set the location
  const response  = await groupDevicesDb.allDocs({include_docs:true})
  const devices = response
      .rows
      .map(row => row.doc)
  if (devices.length > 0) {
    let device = devices[0]
    let syncLocation = device.syncLocations[0]
    let locationSetting = syncLocation.value.slice(-1).pop()
    let location = {
      [`${locationSetting.level}`]: locationSetting.value
    }
    return location
  }
}

async function go() {
  let numberOfCasesCompleted = 0
  while (numberOfCasesCompleted < numberOfCases) {
    const templateDocs = await fs.readJSON(`${groupPath}/case-export.json`)
    // const substitutions = await fs.readJSON(`${groupPath}/load-testing-definitions.json`)
    const caseDoc = templateDocs.find(doc => doc.type === 'case')
    // Change the case's ID.
    const caseId = uuidv1()
    caseDoc._id = caseId
    // note that participant_id and participantUuid are different!
    const participant_id = Math.round(Math.random() * 1000000)
    const participantUuid = uuidv1()

    let barcode_data = {
      "participant_id": participant_id,
      "treatment_assignment": "Experiment",
      "bin-mother": "A",
      "bin-infant": "B",
      "sub-studies": {"S1": true, "S2": false, "S3": false, "S4": true}
    }
    let tangerineModifiedOn = new Date();
    // tangerineModifiedOn is set to numberOfCasesCompleted days before today, and its time is set based upon numberOfCasesCompleted.
    tangerineModifiedOn.setDate(tangerineModifiedOn.getDate() - numberOfCasesCompleted);
    tangerineModifiedOn.setTime(tangerineModifiedOn.getTime() - (numberOfCases - numberOfCasesCompleted))
    const location = await setLocation(groupId);
    console.log("location: " + JSON.stringify(location));
    if (!location) {
      throw new Error('No location! You need to create at least one Device Registration so that the generated docs will sync.')
    }
    const day = String(tangerineModifiedOn.getDate()).padStart(2, '0');
    const month = String(tangerineModifiedOn.getMonth() + 1).padStart(2, '0');
    const year = tangerineModifiedOn.getFullYear();
    const date = year + '-' + month + '-' + day;

    let subs = {
      "runOnce": {}
    }
    
    subs.firstname = () => random_name({first: true, gender: "female"})
    subs.surname = () => random_name({last: true})
    subs.tangerineModifiedOn = tangerineModifiedOn
    subs.day = day
    subs.month = month
    subs.year = year
    subs.date = date
    subs.participant_id = participant_id
    subs.participantUuid = participantUuid
    
    let allSubs = {...subs, ...customGenerators}

    if (customSubstitutions) {
      // assign any customSubstitutions where runOnce is set.
      for (const docTypeDefinition in customSubstitutions) {
        // console.log(`docTypeDefinition: ${docTypeDefinition}: ${JSON.stringify(customSubstitutions[docTypeDefinition])}`);
        if (customSubstitutions[docTypeDefinition]['substitutions']) {
          const substitutions = customSubstitutions[docTypeDefinition]['substitutions']
          for (const functionDefinition in substitutions) {
            // console.log(`functionDefinition: ${functionDefinition}: ${JSON.stringify(substitutions[functionDefinition])}`);
            if (substitutions[functionDefinition].runOnce) {
              subs.runOnce[substitutions[functionDefinition].functionName] = allSubs[substitutions[functionDefinition].functionName]()
            }
          }
        }
      }
    }
    
    let caseMother = {
      _id: caseId,
      tangerineModifiedOn: subs.tangerineModifiedOn,
      "participants": [{
        "id": participantUuid,
        "caseRoleId": "mother-role",
        "data": {
          "firstname": subs.runOnce.firstname ? subs.runOnce.firstname : subs.firstname(),
          "surname": subs.runOnce.surname ? subs.runOnce.surname : subs.surname(),
          "participant_id": subs.runOnce.participant_id ? subs.runOnce.participant_id : subs.participant_id
        }
      }],
    }
    // console.log("motherId: " + caseId + " participantId: " + participant_id + " surname: " + subs.surname);
    console.log("caseMother: " + JSON.stringify(caseMother));
    Object.assign(caseDoc, caseMother);

    if (customSubstitutions) {
      const caseDocSubs = customSubstitutions.find(doc => doc.type === 'caseDoc')
      if (caseDocSubs['substitutions']) {
        for (const substitution of caseDocSubs['substitutions']) {
          console.log(substitution);
          // TODO: finish this...
        }
      }
    } else {
      caseDoc.items[0].inputs[0].value = subs.participant_id;
      // caseDoc.items[0].inputs[2].value = enrollment_date;
      caseDoc.items[0].inputs[4].value = subs.firstname;
      caseDoc.items[0].inputs[5].value = subs.surname;
      caseDoc.items[0].inputs[6].value = subs.participant_id;
      caseDoc.location = location
    }

    for (let caseEvent of caseDoc.events) {
      const caseEventId = uuidv1()
      caseEvent.id = caseEventId
      caseEvent.caseId = caseId
      for (let eventForm of caseEvent.eventForms) {
        eventForm.id = uuidv1()
        eventForm.caseId = caseId
        eventForm.caseEventId = caseEventId
        if (eventForm.eventFormDefinitionId !== "enrollment-screening-form") {
          eventForm.participantId = participantUuid
        }
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
          formResponse.location = location
          formResponse.caseEventId = caseEventId
          formResponse.caseId = caseId
          formResponse.eventFormId = eventForm.id
          if (eventForm.eventFormDefinitionId !== "enrollment-screening-form") {
            formResponse.participantId = participantUuid
          }
        }
      }
    }
    caseDoc.location = await setLocation.call(this);

    if (customSubstitutions) {
      const demoDocSubs = customSubstitutions.find(doc => doc.type === 'demoDoc')
      const demoDoc = templateDocs.find(doc => doc.form.id === demoDocSubs.formId)
      let inputs = []
      demoDoc.items.forEach(item => inputs = [...inputs, ...item.inputs])

      if (demoDocSubs['substitutions']) {
        for (const [inputName, functionDefinition] of Object.entries(demoDocSubs['substitutions'])) {
          let foundInput = inputs.find(input => {
            if (input.name === inputName) {
              return input
            }
          })
          if (foundInput) {
            let functionName = functionDefinition.functionName
            if (functionDefinition.runOnce) {
              let val =   allSubs.runOnce[functionDefinition.functionName]
              // console.log("allSubs.runOnce: " + JSON.stringify(allSubs.runOnce))
              // console.log("Assigned function name using runOnce value: " + functionDefinition.functionName + " to value: " + val)
              foundInput['value'] = val
            } else {
              let val =  allSubs[functionName]()
              // console.log("Assigned function name use live generated value: " + functionName + " to value: " + val)
              foundInput['value'] = val
            }
          }
        }
      }
    } else {
      // modify the demographics form - s01a-participant-information-f254b9
      const demoDoc = templateDocs.find(doc => doc.form.id === 'mnh_screening_and_enrollment')
      if (typeof demoDoc !== 'undefined') {
        demoDoc.items[0].inputs[1].value = subs.participant_id;
        demoDoc.items[0].inputs[3].value = subs.date;
        // "id": "randomization",
        // demoDoc.items[10].inputs[1].value = barcode_data;
        // demoDoc.items[10].inputs[2].value = subs.participant_id;
        // demoDoc.items[10].inputs[7].value = enrollment_date;
        // "id": "participant_information",
        demoDoc.items[5].inputs[1].value = subs.firstname;
        demoDoc.items[5].inputs[2].value = subs.surname;
      }
    }

    // Upload the profiles first
    // now upload the others
    for (let doc of templateDocs) {
      try {
        delete doc._rev
        await db.put(doc)
        // console.log("doc id: " + doc._id)
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
