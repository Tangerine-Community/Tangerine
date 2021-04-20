const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()

module.exports = {
  name: 'synapse',
  hooks: {
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        console.log(`removing db ${groupName}-synapse`)
        let db = new DB(`${groupName}-synapse`)
        await db.destroy()
        db = new DB(`${groupName}-synapse-sanitized`)
        await db.destroy()
      }
      return data
    },
    reportingOutputs: async function(data) {
      async function generateDatabase(sourceDb, targetDb, doc, locationList, sanitized, exclusions, substitutions, pii) {
        if (exclusions && exclusions.includes(doc.form.id)) {
          // skip!
        } else {
          if (doc.form.id === 'user-profile') {
            await saveFlatResponse({...doc, type: "user-profile"}, locationList, targetDb, sanitized, substitutions, pii);
          } else {
            if (doc.type === 'case') {
              // output case
              await saveFlatResponse(doc, locationList, targetDb, sanitized, substitutions, pii);
              let numInf = getItemValue(doc, 'numinf')
              let participant_id = getItemValue(doc, 'participant_id')

              // output participants
              for (const participant of doc.participants) {
                await pushResponse({
                  ...participant,
                  _id: participant.id,
                  caseId: doc._id,
                  numInf: participant.participant_id === participant_id ? numInf : '',
                  type: "participant"
                }, targetDb);
              }
            
              // output case-events
              for (const event of doc.events) {
                // output event-forms
                if (event['eventForms']) {
                  for (const eventForm of event['eventForms']) {
                    // for (let index = 0; index < event['eventForms'].length; index++) {
                    // const eventForm = event['eventForms'][index]
                    try {
                      await pushResponse({...eventForm, type: "event-form", _id: eventForm.id}, targetDb);
                    } catch (e) {
                      if (e.status !== 404) {
                        console.log("Error processing eventForm: " + JSON.stringify(e) + " e: " + e)
                      }
                    }
                  }
                } else {
                  console.log("Synapse - NO eventForms! doc _id: " + doc._id + " in database " +  sourceDb.name + " event: " + JSON.stringify(event))
                }
                // Make a clone of the event so we can delete part of it but not lose it in other iterations of this code
                // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
                const eventClone = Object.assign({}, event);
                // Delete the eventForms array from the case-event object - we don't want this duplicate structure 
                // since we are already serializing each event-form and have the parent caseEventId on each one.
                delete eventClone.eventForms
                await pushResponse({...eventClone, _id: eventClone.id, type: "case-event"}, targetDb)
              }
            } else {
              await saveFlatResponse(doc, locationList, targetDb, sanitized, substitutions, pii);
            }
          }
        }
      }
        
      const {doc, sourceDb} = data
      const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
      // const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
      const groupsDb = await new DB(`groups`);
      const groupDoc = await groupsDb.get(`${sourceDb.name}`)
      const exclusions = groupDoc['exclusions']
      const substitutions = groupDoc['substitutions']
      const pii = groupDoc['pii']
      // First generate the full-cream database
      let synapseDb
      try {
        synapseDb = await new DB(`${sourceDb.name}-synapse`);
      } catch (e) {
        console.log("Error creating db: " + JSON.stringify(e))
      }
      let sanitized = false;
      await generateDatabase(sourceDb, synapseDb, doc, locationList, sanitized, exclusions, substitutions, pii);
      
      // Then create the sanitized version
      let synapseSanitizedDb
      try {
        synapseSanitizedDb = await new DB(`${sourceDb.name}-synapse-sanitized`);
      } catch (e) {
        console.log("Error creating db: " + JSON.stringify(e))
      }
      sanitized = true;
      await generateDatabase(sourceDb, synapseSanitizedDb, doc, locationList, sanitized, exclusions, substitutions, pii);
      return data
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


/** This function processes form response, making the data structure flatter.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 * @param {boolean} sanitized - flag if data must filter data based on the identifier flag.
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, locationList, sanitized, substitutions, pii) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    formTitle: formResponse.form.title,
    startUnixtime: formResponse.startUnixtime,
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete
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
  
  let formDefinition;
  try {
    const contentPath = `/tangerine/groups/${formResponse.groupId}/client/${formResponse.form.id}/form.json`
    formDefinition = JSON.parse(await readFile(`${contentPath}`))
    console.log("Using formDefinition")
  } catch (e) {
    // no formDefinition available; use stored version.
    console.log("No formDefinition for " + formResponse.form.id)
    console.log("substitutions: " + JSON.stringify(substitutions))
      if (substitutions && substitutions[formResponse.form.id]) {
        const substituteFormId = substitutions[formResponse.form.id]
        console.log("substitution: " + substituteFormId)
        const contentPath = `/tangerine/groups/${formResponse.groupId}/client/${substituteFormId}/form.json`
        formDefinition = JSON.parse(await readFile(`${contentPath}`))
        console.log("Now using formDefinition!")
      } else {
        
      }
  }
  for (let item of formResponse.items) {
    let formDefItem
    if (formDefinition) {
      formDefItem = formDefinition.items.find(currentItem => currentItem.id === item.id)
    }
    for (let input of item.inputs) {
      let formDefInput
      if (formDefItem) {
        formDefInput = formDefItem.inputEls.find(currentInput => currentInput.name === input.name)
      }
      let sanitize = false;
      if (sanitized) {
        // console.log("pii: " + pii)
        if (formDefInput && formDefInput.identifier) {
          sanitize = true
        } else if (pii.includes(input.name)) {
          console.log("YES: pii in : " + input.name)
          sanitize = true
        } else if (input.identifier) {
          sanitize = true
        }
      }
      if (!sanitize) {
      // Simplify the keys by removing formID.itemId
      let firstIdSegment = ""
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.level}`, group.value)
          locationKeys.push(group.value)
          try {
            const location = getLocationByKeys(locationKeys, locationList)
            for (let keyName in location) {
              if (keyName !== 'children') {
                set(input, `${firstIdSegment}${input.name}.${group.level}_${keyName}`, location[keyName])
              }
            }
          } catch(e) {
            set(input, `${firstIdSegment}${input.name}.${group.level}_label`, 'orphaned')
          }
        }
      } else if (input && typeof input.value === 'string') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && typeof input.value === 'number') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.name}`, group.value)
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          set(input, `${firstIdSegment}${input.name}.${key}`, input.value[key])
        };
      }
      } // sanitize
    }
  }
  return flatFormResponse;
};

function pushResponse(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(true))
          .catch(error => reject(`synapse pushResponse could not overwrite ${doc._id} to ${db.name} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        const docClone = Object.assign({}, doc);
        // Make a clone of the doc so we can delete part of it but not lose it in other iterations of this code
        // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
        // delete the _rev property from the docClone
        delete docClone._rev
        db.put(docClone)
          .then(_ => resolve(true))
          .catch(error => reject(`synapse pushResponse could not save ${docClone._id} to ${docClone.name} because Error of ${JSON.stringify(error)}`))
    });
  })
}

async function saveFlatResponse(doc, locationList, targetDb, sanitized, substitutions, pii) {
  let flatResponse = await generateFlatResponse(doc, locationList, sanitized, substitutions, pii);
  // make sure the top-level properties of doc are copied.
  const topDoc = {}
  Object.entries(doc).forEach(([key, value]) => value === Object(value) ? null : topDoc[key] = value);
  await pushResponse({...topDoc,
    data: flatResponse
  }, targetDb);
}

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}
