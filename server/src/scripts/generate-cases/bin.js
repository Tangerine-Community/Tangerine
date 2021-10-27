#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Start by populating a case on your tablet. Then export it in dev tools using the copy(caseService.export()).')
  console.log('Place copied output in a case-export.json file in your group\'s content folder, then run this command.')
  console.log('Usage:')
  console.log('       generate-cases <numberOfCases> <groupId> <registrationFormName>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
const { v1: uuidv1 } = require('uuid')
const random_name = require('node-random-name');
const numberOfCases = parseInt(process.argv[2])
const groupId = process.argv[3];
const number_of_sequences = 10
let registrationFormName = process.argv[4];
if (!registrationFormName) {
  registrationFormName =  'registration-role-1'
  console.log("expecting a registration form called " + registrationFormName + ". If the case uses a different name, append it to this command.")
}

const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)
const groupDevicesDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}-devices`)
const groupPath = '/tangerine/groups/' + groupId + '/client'
console.log("groupPath: " + groupPath)

// const {customGenerators, customSubstitutions} = require(`${groupPath}/custom-generators.js`)
let customGenerators, customSubstitutions
try {
  const genny = require(`${groupPath}/custom-generators.js`)
  // console.log("customGenerators: " + JSON.stringify(genny))
  customGenerators = genny.customGenerators
  customSubstitutions = genny.customSubstitutions
} catch(e) {
  customGenerators = {}
  customSubstitutions = null
  console.error(e.message);
  console.error("custom-generators.js not found. No custom work for you!");
}

async function setLocation(groupId) {
  // Get a Device to set the location
  const response  = await groupDevicesDb.query('listDevices', {
    include_docs: true
  })
  const devices = response
      .rows
      .map(row => row.doc)

  if (devices.length > 0) {
    let device = devices[0]
    // console.log("device: " + JSON.stringify(device))
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
    caseDoc.groupId = groupId
    // note that participant_id and participantUuid are different!
    // const participant_id = Math.round(Math.random() * 1000000)
    const participantUuid = uuidv1()
    let tangerineModifiedOn = new Date();
    // tangerineModifiedOn is set to numberOfCasesCompleted days before today, and its time is set based upon numberOfCasesCompleted.
    tangerineModifiedOn.setDate(tangerineModifiedOn.getDate() - numberOfCasesCompleted);
    tangerineModifiedOn.setTime(tangerineModifiedOn.getTime() - (numberOfCases - numberOfCasesCompleted))
    const location = await setLocation(groupId);
    // console.log("location: " + JSON.stringify(location));
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
    subs.participant_id = () => String(Math.round(Math.random() * 1000000))
    subs.tangerineModifiedOn = tangerineModifiedOn
    subs.day = day
    subs.month = month
    subs.year = year
    subs.date = date
    // subs.participant_id = participant_id
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
        "caseRoleId": "role-1",
        "data": {
          "firstname": subs.runOnce.firstname ? subs.runOnce.firstname : subs.firstname(),
          "surname": subs.runOnce.surname ? subs.runOnce.surname : subs.surname(),
          "participant_id": subs.runOnce.participant_id ? subs.runOnce.participant_id : subs.participant_id
        }
      }],
    }
    // console.log("motherId: " + caseId + " participantId: " + participant_id + " surname: " + subs.surname);
    console.log("caseMother: " + JSON.stringify(caseMother));
    
    // let barcode_data = {
    //   "participant_id": subs.runOnce.participant_id,
    //   "treatment_assignment": "Experiment",
    //   "bin-mother": "A",
    //   "bin-infant": "B",
    //   "sub-studies": {"S1": true, "S2": false, "S3": false, "S4": true}
    // }
    //
    // console.log("barcode_data: " + JSON.stringify(barcode_data))
    
    Object.assign(caseDoc, caseMother);

    if (customSubstitutions) {
      const caseDocSubs = customSubstitutions.find(doc => doc.type === 'caseDoc')
      // if (caseDocSubs && caseDocSubs['substitutions']) {
      //   for (const substitution of caseDocSubs['substitutions']) {
      //     console.log("substitution: " + substitution);
      //     // TODO: finish this...
      //   }
      // }
      let inputs = []
      caseDoc.items.forEach(item => inputs = [...inputs, ...item.inputs])
      if (caseDocSubs['substitutions']) {
        for (const [inputName, functionDefinition] of Object.entries(caseDocSubs['substitutions'])) {
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
              console.log("Assigned function name use live generated value: " + functionName + " to value: " + val)
              foundInput['value'] = val
            }
          }
        }
      }
    } else {
      caseDoc.items[0].inputs[0].value = subs.runOnce.participant_id;
      // caseDoc.items[0].inputs[2].value = enrollment_date;
      if (caseDoc.items[0].inputs.length > 4) {
        console.log("Processing inputs: " + JSON.stringify(caseDoc.items[0].inputs))
        caseDoc.items[0].inputs[1].value = subs.runOnce.participant_id;
        caseDoc.items[0].inputs[2].value = subs.firstname();
        caseDoc.items[0].inputs[3].value = subs.surname();
      }
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
      const demoDoc = templateDocs.find(doc => doc.form.id === registrationFormName)
      if (typeof demoDoc !== 'undefined') {
        demoDoc.items[1].inputs[1].value = subs.runOnce.participant_id;
        demoDoc.items[1].inputs[2].value = subs.date;
        // "id": "randomization",
        // demoDoc.items[10].inputs[1].value = barcode_data;
        // demoDoc.items[10].inputs[2].value = subs.participant_id;
        // demoDoc.items[10].inputs[7].value = enrollment_date;
        // "id": "participant_information",
        if (demoDoc.items[0]) {
          console.log("Filling out firstname and surname: " + subs.firstname() + subs.surname())
          demoDoc.items[0].inputs[0].value = subs.firstname();
          demoDoc.items[0].inputs[1].value = subs.surname();
        } else {
          console.log("Unable to substitute the firstname and surname; they are expected to be ar demoDoc.items[0].inputs[0]")
        }
        
      }
    }

    // Upload the profiles first
    // now upload the others
    let docsSaved = 0
    for (let index = 0; index < templateDocs.length; index++) {
      const doc = templateDocs[index]
      try {
        delete doc._rev
        let newDoc = await db.put(doc)
        // console.log("Saved the doc _rev: " + doc._rev + " newDoc.rev: " + newDoc.rev)
        // console.log("newDoc: " + JSON.stringify(newDoc))
        // newDoc._id = doc._id
        // newDoc._rev = doc._rev
        doc._rev = newDoc.rev
        // console.log("doc id: " + doc._id + " newDoc.id: " + newDoc.id)
        // Save the doc multiple times to create additional sequences.
        const timesToSave = Math.ceil(Math.random() * number_of_sequences)
        // const timesToSave = 30
        console.log("Saving " + doc._id + " " + timesToSave + " times")
        let newRev;
        for (let index = 0; index < timesToSave; index++) {
          doc.changeNumber = index + 1
          // console.log("newDoc.changeNumber: " + newDoc.changeNumber)
          try {
            if (newRev) {
              doc._rev = newRev
              // console.log("newRev: " + newRev)
            }
            let changedDoc = await db.put(doc)
            // newRev = changedDoc._rev
            newRev = changedDoc.rev
            // console.log("changedDoc._rev: " + changedDoc._rev +  " changedDoc.rev: " + changedDoc.rev + " newDoc.rev: " + newDoc.rev)
          } catch (e) {
            console.log("Error: " + JSON.stringify(e))
            debugger
          }
        }
        docsSaved = index
      } catch (e) {
        console.log("Error: " + JSON.stringify(e))
        debugger
      }
    }
    numberOfCasesCompleted++
    console.log("participant_id: " + subs.runOnce.participant_id + " docs saved: " + docsSaved + "; Cases Generated: " + numberOfCasesCompleted + " of " + numberOfCases)
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
