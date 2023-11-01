const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const groupReportingViews = require(`./views.js`)
const moment = require('moment')
const path = require('path')
const tangyModules = require('../index.js')()
const createGroupDatabase = require('../../create-group-database.js')
const groupsList = require('/tangerine/server/src/groups-list.js')

async function insertGroupReportingViews(groupName) {
  let designDoc = Object.assign({}, groupReportingViews)
  let groupDb = new DB(`${groupName}-reporting`)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`group reporting views inserted into ${groupName}-reporting`)
  } catch (error) {
    log.error(error)
  }

  // sanitized
  groupDb = new DB(`${groupName}-reporting-sanitized`)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`group reporting views inserted into ${groupName}-reporting-sanitized`)
  } catch (error) {
    log.error(error)
  }
}

module.exports = {
  name: 'csv',
  hooks: {
    enable: async function() {
      const groups = await groupsList()
      for (groupId of groups) {
        await createGroupDatabase(groupId, '-reporting')
        await createGroupDatabase(groupId, '-reporting-sanitized')
      }
    },
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        let db = DB(`${groupName}-reporting`)
        await db.destroy()
        db = DB(`${groupName}-reporting-sanitized`)
        await db.destroy()
        await createGroupDatabase(groupName, '-reporting')
        await createGroupDatabase(groupName, '-reporting-sanitized')
        await insertGroupReportingViews(groupName)
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
        try {
          const {doc, sourceDb} = data
          const groupId = sourceDb.name
          // TODO: Can't the fetch of the locationList be cached?
          const locationLists = await tangyModules.getLocationLists(sourceDb.name)
          // console.log(doc.type)
          // @TODO Rename `-reporting` to `-csv`.
          const REPORTING_DB = new DB(`${sourceDb.name}-reporting`);
          // @TODO Rename `-reporting` to `-csv-sanitized`.
          const SANITIZED_DB = new DB(`${sourceDb.name}-reporting-sanitized`);
          
          if (doc.type !== 'issue') {
            let flatResponse = await generateFlatResponse(doc, locationLists, false, groupId);
            // Process the flatResponse
            let processedResult = flatResponse;
            // Don't add user-profile to the user-profile
            if (processedResult.formId !== 'user-profile') {
              processedResult = await attachUserProfile(processedResult, REPORTING_DB, sourceDb, locationLists)
            }
            // @TODO Ensure design docs are in the database.
            await saveFormInfo(processedResult, REPORTING_DB);
            await saveFlatFormResponse(processedResult, REPORTING_DB);
            // Index the view now.
            await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})

            // Sanitizing the data:
            // Repeat the flattening in order to deliver sanitized (non-PII) output
            flatResponse = await generateFlatResponse(doc, locationLists, true, groupId);
            // Process the flatResponse
            processedResult = flatResponse
            // Don't add user-profile to the sanitized db
            // @TODO Ensure design docs are in the database.
            await saveFormInfo(processedResult, SANITIZED_DB);
            await saveFlatFormResponse(processedResult, SANITIZED_DB);
            // Index the view now.
            await SANITIZED_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
          }
          if (doc.type === 'case') {
            let numInf = getItemValue(doc, 'numinf')
            let participant_id = getItemValue(doc, 'participant_id')

            const startUnixtime = doc.startUnixtime
            const lastSaveUnixtime = doc.lastSaveUnixtime

            // output participants
            for (const participant of doc.participants) {
              const flattenedParticipant = {
                ...participant,
                ...(participant.data ? Object.keys(participant.data).reduce((safeData, key)=>{return {...safeData, [`data_${key}`]:participant.data[key]}},{}):{}),
                _id: participant.id,
                caseId: doc._id,
                numInf: participant.participant_id === participant_id ? numInf : '',
                formId: "participant",
                startUnixtime,
                lastSaveUnixtime,
                groupId
              }
              await saveFormInfo(flattenedParticipant, REPORTING_DB);
              await saveFlatFormResponse(flattenedParticipant, REPORTING_DB);
              // Index the view now.
              await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
              // @TODO Ensure design docs are in the database.
              await saveFormInfo(flattenedParticipant, SANITIZED_DB);
              await saveFlatFormResponse(flattenedParticipant, SANITIZED_DB);
              // Index the view now.
              await SANITIZED_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
            }
            
          
            // output case-events
            for (const event of doc.events) {
              // output event-forms
              if (event['eventForms']) {
                for (const eventForm of event['eventForms']) {
                  // for (let index = 0; index < event['eventForms'].length; index++) {
                  // const eventForm = event['eventForms'][index]
                  try {
                    const flattenedEventForm = { 
                      ...eventForm,
                      formId: "event-form",
                      ...(eventForm.data ? Object.keys(eventForm.data).reduce((safeData, key)=>{return {...safeData, [`data_${key}`]:eventForm.data[key]}},{}):{}),
                      _id: eventForm.id,
                      startUnixtime,
                      lastSaveUnixtime,
                      groupId
                    };
                    await saveFormInfo(flattenedEventForm, REPORTING_DB);
                    await saveFlatFormResponse(flattenedEventForm, REPORTING_DB);
                    // Index the view now.
                    await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
                    // @TODO Ensure design docs are in the database.
                    await saveFormInfo(flattenedEventForm, SANITIZED_DB);
                    await saveFlatFormResponse(flattenedEventForm, SANITIZED_DB);
                    // Index the view now.
                    await SANITIZED_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
                  } catch (e) {
                    if (e.status !== 404) {
                      console.log("Error processing eventForm: " + JSON.stringify(e) + " e: " + e)
                    }
                  }
                }
              } else {
                console.log("Mysql - NO eventForms! doc _id: " + doc._id + " in database " +  sourceDb.name + " event: " + JSON.stringify(event))
              }
              // Make a clone of the event so we can delete part of it but not lose it in other iterations of this code
              // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
              const eventClone = Object.assign({}, event);
              // Delete the eventForms array from the case-event object - we don't want this duplicate structure 
              // since we are already serializing each event-form and have the parent caseEventId on each one.
              delete eventClone.eventForms
              const flattenedCaseEvent = 
                {
                  ...eventClone,
                  ...(eventClone.data ? Object.keys(eventClone.data).reduce((safeData, key)=>{return {...safeData, [`data_${key}`]:eventClone.data[key]}},{}):{}),
                  _id: eventClone.id,
                  formId: "case-event",
                  startUnixtime,
                  lastSaveUnixtime,
                  groupId
                };
                await saveFormInfo(flattenedCaseEvent, REPORTING_DB);
                await saveFlatFormResponse(flattenedCaseEvent, REPORTING_DB);
                // Index the view now.
                await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
                // @TODO Ensure design docs are in the database.
                await saveFormInfo(flattenedCaseEvent, SANITIZED_DB);
                await saveFlatFormResponse(flattenedCaseEvent, SANITIZED_DB);
                // Index the view now.
                await SANITIZED_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
            }
          }
          resolve(data)
        } catch(e) {
          reject(e)
        }
      })
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        await createGroupDatabase(groupName, '-reporting')
        await createGroupDatabase(groupName, '-reporting-sanitized')
        await insertGroupReportingViews(groupName)
        resolve(data)
      })
    }
  }
}

const getItemValue = (doc, variableName) => {
  const variablesByName = doc.items.reduce((variablesByName, item) => {
    for (const input of item.inputs) {
      variablesByName[input.name] = input.value;
    }
    return variablesByName;
  }, {});
  return variablesByName[variableName];
};


/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 * @param {boolean} sanitized - flag if data must filter data based on the identifier flag.
 *
 * @returns {object} processed results for csv
 */

const  generateFlatResponse = async function (formResponse, locationLists, sanitized, groupId) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  const cycleSequencesReplacer = new RegExp('\n', 'g')
  const startDatetime = moment(formResponse.startUnixtime).format('yyyy-MM-DD hh:mm:ss') || ''
  const endDatetime = moment(formResponse.endUnixtime).format('yyyy-MM-DD hh:mm:ss') || ''
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    cycleSequences: formResponse.form.cycleSequences? formResponse.form.cycleSequences.replace(cycleSequencesReplacer,'  '): '',
    sequenceOrderMap: formResponse.form.sequenceOrderMap?formResponse.form.sequenceOrderMap:'',
    startUnixtime: formResponse.startUnixtime||'',
    startDatetime: startDatetime,
    endUnixtime: formResponse.endUnixtime||'',
    endDatetime: endDatetime,
    lastSaveUnixtime: formResponse.lastSaveUnixtime||'',
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete,
    // NOTE: Doubtful that anything with an archived flag would show up here because it would have been deleted already in 'Delete from the -reporting db.'
    archived: formResponse.archived,
    tangerineModifiedByUserId: formResponse.tangerineModifiedByUserId,
    ...formResponse.caseId ? {
      caseId: formResponse.caseId,
      eventId: formResponse.eventId,
      eventFormId: formResponse.eventFormId,
      participantId: formResponse.participantId || ''
    } : {}
  };
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    flatFormResponse[`${item.id}_firstOpenTime`]= item.firstOpenTime? item.firstOpenTime:''
    flatFormResponse[`${item.id}_disabled`] = item.disabled ? 'true' : 'false'
    for (let input of item.inputs) {
      let sanitize = false;
      if (sanitized) {
        if (input.identifier) {
          sanitize = true
        }
      }
      if (!sanitize) {
        if (input.tagName === 'TANGY-LOCATION') {
          // Populate the id, label and metadata columns for TANGY-LOCATION levels in the current location list.
          // The location list may be change over time. When values are changed, we attempt to adjust 
          // so the current values appear in the outputs.

          // This input has an attribute 'locationSrc' with a path to the location list that starts with './assets/'
          // We need to compare file names instead of paths since it is different on the server
          let inputLocationFileName = input.locationSrc ? path.parse(input.locationSrc).base : `location-list.json`
          console.log(inputLocationFileName)
          const locationList = locationLists.find(locationList => inputLocationFileName == path.parse(locationList.path).base)
          console.log(locationList.id)
          locationKeys = []
          for (let group of input.value) {
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.${group.level}`, group.value)
            locationKeys.push(group.value)
            try {
              const location = getLocationByKeys(locationKeys, locationList)
              for (let keyName in location) {
                if (['descendantsCount', 'children', 'parent'].includes(keyName)) {
                  continue
                }
                tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.${group.level}_${keyName}`, location[keyName])                
              }
            } catch (e) {
              // Since tangy-form v4.42.0, tangy-location widget saves the label in the value
              // use the label value saved in the form response if it is not found in the current location list.
              // If no label appears in the form response, then we put 'orphanced' for the label. 
              const valueLabel = group.label ? group.label : 'orphaned'
              tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.${group.level}_label`, valueLabel)
            }
          }
        } else if (input.tagName === 'TANGY-RADIO-BUTTONS' || input.tagName === 'TANGY-RADIO-BLOCKS') {
          // Expected value type of input.value is Array, but custom logic may accidentally assign a different data type.
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, Array.isArray(input.value) 
            ? input.value.find(input => input.value == 'on')
              ? input.value.find(input => input.value == 'on').name
              : ''
            : `${input.value}`
          )
        } else if (input.tagName === 'TANGY-RADIO-BUTTON') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value
              ? '1'
              : '0'
          )
        } else if (input.tagName === 'TANGY-CHECKBOXES') {
          // Expected value type of input.value is Array, but custom logic may accidentally assign a different data type.
          if (Array.isArray(input.value)) {
            for (let checkboxInput of input.value) {
              tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}_${checkboxInput.name}`, checkboxInput.value
                  ? "1"
                  : "0"
              )
            }
          } else {
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, `${input.value}`) 
          }
        } else if (input.tagName === 'TANGY-CHECKBOX') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value
              ? "1"
              : "0"
          )
        } else if (input.tagName === 'TANGY-SIGNATURE') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value
              ? `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/app/${groupId}/response-variable-value/${formResponse._id}/${input.name}`
              : ""
          )         
        } else if (input.tagName === 'TANGY-PHOTO-CAPTURE') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value
              ? `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/app/${groupId}/response-variable-value/${formResponse._id}/${input.name}`
              : ""
          )         
        } else if (input.tagName === 'TANGY-VIDEO-CAPTURE') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value
              ? `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/app/${groupId}/response-variable-value/${formResponse._id}/${input.name}`
              : ""
          )
        } else if (input.tagName === 'TANGY-EFTOUCH') {
          let elementKeys = Object.keys(input.value);
          for (let key of elementKeys) {
            tangyModules.setVariable(flatFormResponse, 
              input, 
              `${formID}.${item.id}.${input.name}.${key}`, 
              Array.isArray(input.value[key])
                ? input.value[key].join('|')
                : input.value[key]
            )
          }
        } else if (input.tagName === 'TANGY-TIMED') {
          let hitLastAttempted = false
          for (let toggleInput of input.value) {
            let derivedValue = ''
            if (hitLastAttempted === true) {
              // Not attempted.
              derivedValue = '.'
            } else if (toggleInput.value === 'on' || toggleInput.pressed === true) {
              // If toggle is 'on' (manually pressed) or pressed is true (row marked), the item is incorrect.
              derivedValue = '0'
            } else {
              // Correct.
              derivedValue = '1'
            }
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.duration`, input.duration)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.time_remaining`, input.timeRemaining)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.gridAutoStopped`, input.gridAutoStopped)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.autoStop`, input.autoStop)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.item_at_time`, input.gridVarItemAtTime ? input.gridVarItemAtTime : '')
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.time_intermediate_captured`, input.gridVarTimeIntermediateCaptured ? input.gridVarTimeIntermediateCaptured : '')
          // Calculate Items Per Minute.
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          let timeSpent = input.duration - input.timeRemaining
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.items_per_minute`, Math.round(numberOfItemsCorrect / (timeSpent / 60)))
        } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
          let hitLastAttempted = false
          for (let toggleInput of input.value) {
            let derivedValue = ''
            if (hitLastAttempted === true) {
              // Not attempted.
              derivedValue = '.'
            } else if (toggleInput.value === 'on') {
              // Incorrect.
              derivedValue = '0'
            } else {
              // Correct.
              derivedValue = '1'
            }
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let totalNumberOfItems = input.value.length
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = totalNumberOfItems - numberOfItemsIncorrect
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.gridAutoStopped`, input.gridAutoStopped)
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.autoStop`, input.autoStop)
        } else if (input.tagName === 'TANGY-BOX' || (input.tagName === 'TANGY-TEMPLATE' && input.value === undefined) || input.name === '') {
          // Do nothing :).
        } else if (input && typeof input.value === 'string') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value)
        } else if (input && typeof input.value === 'number') {
          tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}`, input.value)
        } else if (input && Array.isArray(input.value)) {
          for (let group of input.value) {
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.${group.name}`, group.value)
          }
        } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
          let elementKeys = Object.keys(input.value);
          for (let key of elementKeys) {
            tangyModules.setVariable(flatFormResponse, input, `${formID}.${item.id}.${input.name}.${key}`, input.value[key])
          }
          ;
        }
      } // sanitize
    }
  }
  let data = await tangyModules.hook("csv_flatFormReponse", {flatFormResponse, formResponse});
  return data.flatFormResponse;
};

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}

function saveFormInfo(flatResponse, db) {
  return new Promise(async (resolve, reject) => {
    // Find any new headers and insert them into the headers doc.
    let foundNewHeaders = false
    let formDoc = {
      _id: flatResponse.formId,
      columnHeaders: []
    }
    // Get the doc if it already exists.
    try {
      let doc = await db.get(formDoc._id)
      formDoc = doc
    } catch(e) {
      // It's a new doc, no worries.
    }
    Object.keys(flatResponse).forEach(key => {
      if (formDoc.columnHeaders.find(header => header.key === key) === undefined) {
        // Carve out the string that editor puts in IDs in order to make periods more reliable for determining data according to period delimited convention.
        let safeKey = key.replace('form-0.', '')
        // Make the header property (AKA label) just the variable name.
        const firstOccurenceIndex = safeKey.indexOf('.')
        const secondOccurenceIndex = safeKey.indexOf('.', firstOccurenceIndex+1)
        let keyArray = key.split('.')
        // console.log("key: " + key + " keyArray: " + JSON.stringify(keyArray))
        // Preserve the namespacing of user-profile
        if (keyArray[0] === 'user-profile') {
          formDoc.columnHeaders.push({ key, header: safeKey })
        } else {
          formDoc.columnHeaders.push({ key, header: safeKey.substr(secondOccurenceIndex+1, safeKey.length) })
        }
        foundNewHeaders = true
      }
    })
    if (foundNewHeaders) {
      try {
        await db.put(formDoc)
      } catch(err) {
        log.error("Error processing columnHeaders in " + db.name + " flatResponse: " + JSON.stringify(flatResponse) + " formDoc: " + JSON.stringify(formDoc) + " Error: " + err)
        reject(err)
      }
    }
    resolve(true)
  })
}

function saveFlatFormResponse(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
        .then(oldDoc => {
          // Overrite the _rev property with the _rev in the db and save again.
          const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
          db.put(updatedDoc)
              .then(_ => resolve(true))
              .catch(error => reject(`Could not save Flattened Form Response ${JSON.stringify(updatedDoc._id)} because Error of ${JSON.stringify(error)}`))
        })
        .catch(error => {
          db.put(doc)
              .then(_ => resolve(true))
              .catch(error => reject(`Could not save Flattened Form Response ${JSON.stringify(doc)._id} because Error of ${JSON.stringify(error)}`))
        });
  })
}



async function attachUserProfile(doc, reportingDb, sourceDb, locationList) {
    try {
      let userProfileId = doc.tangerineModifiedByUserId
      if (!userProfileId) {
        // try an older profileId
        console.log("CSV generation - using older userProfileId as key instead of tangerineModifiedByUserId: " + userProfileId)
        // Find the key that points to user profile ID.
        const userProfileIdKey = Object.keys(doc).find(key => key.includes('userProfileId'))
        userProfileId = doc[userProfileIdKey]
      }
      // console.log("CSV generation for doc _id: " + doc._id + "; adding userProfile to doc with userProfileId: " + userProfileId + " ")
      let userProfileDoc;
      if (userProfileId !== 'Editor') {
        // Get the user profile.
        try {
          userProfileDoc = await reportingDb.get(userProfileId)
        } catch (e) {
          // log.debug("Info: CSV reportingDb " + reportingDb.name + " does not yet have userProfileId: " + userProfileId + " doc id: " + doc._id + " Error: " + JSON.stringify(e))
          // If it is not (yet) in the reporting db, then try to get it from the sourceDb.
          try {
            let userProfileDocOriginal = await sourceDb.get(userProfileId)
            userProfileDoc = await generateFlatResponse(userProfileDocOriginal, locationLists, false, sourceDb.name);
          } catch (e) {
            // console.log("Error: sourceDb:  " + sourceDb.name + " unable to fetch userProfileId: " + userProfileId + " Error: " + JSON.stringify(e) + " e: " + e.message)
          }
        }

        // Return with merged profile into doc but keep keys namespaced by `user-profile.`. 
        let docWithProfile =  Object.assign({}, doc, Object.keys(userProfileDoc).reduce((acc, key) => {
          let docNamespaced;
          let keyArray = key.split('.')
          // console.log("key: " + key + " keyArray: " + JSON.stringify(keyArray))
          if (keyArray[0] === 'user-profile') {
            docNamespaced = Object.assign({}, acc, { [`${key}`]: userProfileDoc[key] })
          } else {
            docNamespaced = Object.assign({}, acc, { [`user-profile.${key}`]: userProfileDoc[key] })
          }
          return docNamespaced
        }, {}))
        // Remove some unnecessary properties
        delete docWithProfile['user-profile._rev']
        delete docWithProfile['user-profile.formId']
        delete docWithProfile['user-profile.startUnixtime']
        delete docWithProfile['user-profile.endUnixtime']
        delete docWithProfile['user-profile.lastSaveUnixtime']
        delete docWithProfile['user-profile.buildId']
        delete docWithProfile['user-profile.buildChannel']
        delete docWithProfile['user-profile.deviceId']
        delete docWithProfile['user-profile.groupId']
        delete docWithProfile['user-profile.complete']
        delete docWithProfile['user-profile.item1_firstOpenTime']
        delete docWithProfile['user-profile.item1.location.region_id']
        delete docWithProfile['user-profile.item1.location.region_level']
        delete docWithProfile['user-profile.item1.location.region_parent']
        delete docWithProfile['user-profile.item1.location.region_descendantsCount']
        delete docWithProfile['user-profile.item1.location.district_id']
        delete docWithProfile['user-profile.item1.location.district_level']
        delete docWithProfile['user-profile.item1.location.district_parent']
        delete docWithProfile['user-profile.item1.location.district_descendantsCount']
        delete docWithProfile['user-profile.item1.location.facility_id']
        delete docWithProfile['user-profile.item1.location.facility_level']
        delete docWithProfile['user-profile.item1.location.facility_parent']
        delete docWithProfile['user-profile.item1.location.facility_descendantsCount']

        return docWithProfile
      } else {
        // No user profile for editor
        console.log("Returning doc instead of docWithProfile since this is Editor.")
        return doc
      }
      
    } catch (error) {
      // There must not be a user profile yet doc uploaded yet.
      // console.log("Returning doc instead of docWithProfile because user profile not uploaded yet.")
      return doc
    }
}
