const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const groupReportingViews = require(`./views.js`)
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()
const CODE_SKIP = '999'

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
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        let db = DB(`${groupName}-reporting`)
        await db.destroy()
        db = DB(`${groupName}-reporting-sanitized`)
        await db.destroy()
        await insertGroupReportingViews(groupName)
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
        try {
          const {doc, sourceDb} = data
          const groupId = sourceDb.name

          // @TODO Rename `-reporting` to `-csv`.
          const REPORTING_DB = new DB(`${sourceDb.name}-reporting`);
          // @TODO Rename `-reporting` to `-csv-sanitized`.
          const SANITIZED_DB = new DB(`${sourceDb.name}-reporting-sanitized`);
          
          if (doc.type !== 'issue') {
            // TODO: Can't this be cached?
            const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
            if (doc.archived) {
              // Delete from the -reporting db.
              REPORTING_DB.remove(doc)
              SANITIZED_DB.remove(doc)
            } else {
              let flatResponse = await generateFlatResponse(doc, locationList, false, groupId);
              // Process the flatResponse
              let processedResult = flatResponse;
              // Don't add user-profile to the user-profile
              if (processedResult.formId !== 'user-profile') {
                processedResult = await attachUserProfile(processedResult, REPORTING_DB, sourceDb, locationList)
              }
              // @TODO Ensure design docs are in the database.
              await saveFormInfo(processedResult, REPORTING_DB);
              await saveFlatFormResponse(processedResult, REPORTING_DB);
              // Index the view now.
              await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})

              // Sanitizing the data:
              // Repeat the flattening in order to deliver sanitized (non-PII) output
              flatResponse = await generateFlatResponse(doc, locationList, true, groupId);
              // Process the flatResponse
              processedResult = flatResponse
              // Don't add user-profile to the sanitized db
              // @TODO Ensure design docs are in the database.
              await saveFormInfo(processedResult, SANITIZED_DB);
              await saveFlatFormResponse(processedResult, SANITIZED_DB);
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
        await insertGroupReportingViews(groupName)
        resolve(data)
      })
    }
  }
}

/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 * @param {boolean} sanitized - flag if data must filter data based on the identifier flag.
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, locationList, sanitized, groupId) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    startUnixtime: formResponse.startUnixtime||'',
    endUnixtime: formResponse.endUnixtime||'',
    lastSaveUnixtime: formResponse.lastSaveUnixtime||'',
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete,
    tangerineModifiedByUserId: formResponse.tangerineModifiedByUserId,
    ...formResponse.caseId ? {
      caseId: formResponse.caseId,
      eventId: formResponse.eventId,
      eventFormId: formResponse.eventFormId,
      participantId: formResponse.participantId || ''
    } : {}
  };
  function set(input, key, value) {
    flatFormResponse[key] = input.skipped
        ? process.env.T_REPORTING_MARK_SKIPPED_WITH
        : 
        input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
            ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH 
        : 
        value === undefined && process.env.T_REPORTING_MARK_UNDEFINED_WITH !== "ORIGINAL_VALUE"
            ? process.env.T_REPORTING_MARK_UNDEFINED_WITH
            : value
  }
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
          // Populate the ID and Label columns for TANGY-LOCATION levels.
          locationKeys = []
          for (let group of input.value) {
            set(input, `${formID}.${item.id}.${input.name}.${group.level}`, group.value)
            locationKeys.push(group.value)
            try {
              const location = getLocationByKeys(locationKeys, locationList)
              for (let keyName in location) {
                if (keyName !== 'children') {
                  set(input, `${formID}.${item.id}.${input.name}.${group.level}_${keyName}`, location[keyName])
                }
              }
            } catch (e) {
              set(input, `${formID}.${item.id}.${input.name}.${group.level}_label`, 'orphaned')
            }
          }
        } else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
          // Expected value type of input.value is Array, but custom logic may accidentally assign a different data type.
          set(input, `${formID}.${item.id}.${input.name}`, Array.isArray(input.value) 
            ? input.value.find(input => input.value == 'on')
              ? input.value.find(input => input.value == 'on').name
              : ''
            : `${input.value}`
          )
        } else if (input.tagName === 'TANGY-RADIO-BUTTON') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value
              ? '1'
              : '0'
          )
        } else if (input.tagName === 'TANGY-CHECKBOXES') {
          // Expected value type of input.value is Array, but custom logic may accidentally assign a different data type.
          if (Array.isArray(input.value)) {
            for (let checkboxInput of input.value) {
              set(input, `${formID}.${item.id}.${input.name}_${checkboxInput.name}`, checkboxInput.value
                  ? "1"
                  : "0"
              )
            }
          } else {
            set(input, `${formID}.${item.id}.${input.name}`, `${input.value}`) 
          }
        } else if (input.tagName === 'TANGY-CHECKBOX') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value
              ? "1"
              : "0"
          )
        } else if (input.tagName === 'TANGY-SIGNATURE') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value
              ? `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/app/${groupId}/response-variable-value/${formResponse._id}/${input.name}`
              : ""
          )         
        } else if (input.tagName === 'TANGY-PHOTO-CAPTURE') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value
              ? `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/app/${groupId}/response-variable-value/${formResponse._id}/${input.name}`
              : ""
          )         
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
            set(input, `${formID}.${item.id}.${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          set(input, `${formID}.${item.id}.${input.name}.duration`, input.duration)
          set(input, `${formID}.${item.id}.${input.name}.time_remaining`, input.timeRemaining)
          set(input, `${formID}.${item.id}.${input.name}.gridAutoStopped`, input.gridAutoStopped)
          set(input, `${formID}.${item.id}.${input.name}.autoStop`, input.autoStop)
          set(input, `${formID}.${item.id}.${input.name}.item_at_time`, input.gridVarItemAtTime ? input.gridVarItemAtTime : '')
          set(input, `${formID}.${item.id}.${input.name}.time_intermediate_captured`, input.gridVarTimeIntermediateCaptured ? input.gridVarTimeIntermediateCaptured : '')
          // Calculate Items Per Minute.
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
          set(input, `${formID}.${item.id}.${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          set(input, `${formID}.${item.id}.${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          let timeSpent = input.duration - input.timeRemaining
          set(input, `${formID}.${item.id}.${input.name}.items_per_minute`, Math.round(numberOfItemsCorrect / (timeSpent / 60)))
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
            set(input, `${formID}.${item.id}.${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
          set(input, `${formID}.${item.id}.${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          set(input, `${formID}.${item.id}.${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          set(input, `${formID}.${item.id}.${input.name}.gridAutoStopped`, input.gridAutoStopped)
          set(input, `${formID}.${item.id}.${input.name}.autoStop`, input.autoStop)
        } else if (input.tagName === 'TANGY-BOX' || input.name === '') {
          // Do nothing :).
        } else if (input && typeof input.value === 'string') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value)
        } else if (input && typeof input.value === 'number') {
          set(input, `${formID}.${item.id}.${input.name}`, input.value)
        } else if (input && Array.isArray(input.value)) {
          for (let group of input.value) {
            set(input, `${formID}.${item.id}.${input.name}.${group.name}`, group.value)
          }
        } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
          let elementKeys = Object.keys(input.value);
          for (let key of elementKeys) {
            set(input, `${formID}.${item.id}.${input.name}.${key}`, input.value[key])
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
      console.log("CSV generation for doc _id: " + doc._id + "; adding userProfile to doc with userProfileId: " + userProfileId + " ")
      let userProfileDoc;
      if (userProfileId !== 'Editor') {
        // Get the user profile.
        try {
          userProfileDoc = await reportingDb.get(userProfileId)
        } catch (e) {
          // console.log("Info: CSV reportingDb " + reportingDb.name + " does not yet have userProfileId: " + userProfileId + " doc id: " + doc._id + " Error: " + JSON.stringify(e))
          // If it is not (yet) in the reporting db, then try to get it from the sourceDb.
          try {
            let userProfileDocOriginal = await sourceDb.get(userProfileId)
            userProfileDoc = await generateFlatResponse(userProfileDocOriginal, locationList, false, sourceDb.name);
          } catch (e) {
            console.log("Error: sourceDb:  " + sourceDb.name + " unable to fetch userProfileId: " + userProfileId + " Error: " + JSON.stringify(e) + " e: " + e.message)
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
      console.log("Returning doc instead of docWithProfile because user profile not uploaded yet.")
      return doc
    }
}
