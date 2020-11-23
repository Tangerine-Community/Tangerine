const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()
const { rword } = require('rword');
rword.load('big')

const DBNAME = 'redacted'

module.exports = {
  hooks: {
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        console.log(`removing db ${groupName}-${DBNAME}`)
        let db = new DB(`${groupName}-${DBNAME}`)
        await db.destroy()
      }
      return data
    },
    reportingOutputs: function(data) {
      async function generateDatabase(sourceDb, targetDb, doc, locationList, exclusions, resolve) {
        if (exclusions && exclusions.includes(doc.form.id)) {
          // skip!
        } else {
          if (doc.form.id === 'user-profile') {
            await saveRedactedResponse({...doc, type: "user-profile"}, locationList, targetDb, resolve);
          } else {
            if (doc.type === 'case') {
              if (doc.participants) {
                doc.participants.forEach(participant => {
                  participant.data = {}
                })
              }

              if (doc.events) {
                doc.events.forEach(event => {
                  let valueOriginal = event.name
                  const len = valueOriginal.length
                  if (len > 0) {
                    const redactedValue = rword.generate(1, {length: len});
                    event.name = redactedValue
                    changed = true
                  }
                })
              }
              // output case
              await saveRedactedResponse(doc, locationList, targetDb, resolve);
            } else {
              await saveRedactedResponse(doc, locationList, targetDb, resolve);
            }
          }
        }
      }
        
      return new Promise(async (resolve, reject) => {
        const {doc, sourceDb} = data
        const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
        const groupsDb = await new DB(`groups`);
        const groupDoc = await groupsDb.get(`${sourceDb.name}`)
        const exclusions = groupDoc['exclusions']
        // First generate the full-cream database
        let targetDb
        try {
          targetDb = await new DB(`${sourceDb.name}-${DBNAME}`);
        } catch (e) {
          console.log("Error creating db: " + JSON.stringify(e))
        }
        await generateDatabase(sourceDb, targetDb, doc, locationList, exclusions, resolve);
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


/** This function processes form response, making the data structure flatter.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 *
 * @returns {object} processed results for csv
 */

const generateRedactedResponse = async function (formResponse, locationList) {
  let sep = "-"
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  // let flatFormResponse = {
  //   _id: formResponse._id,
  //   formId: formResponse.form.id,
  //   formTitle: formResponse.form.title,
  //   startUnixtime: formResponse.startUnixtime,
  //   buildId: formResponse.buildId||'',
  //   buildChannel: formResponse.buildChannel||'',
  //   deviceId: formResponse.deviceId||'',
  //   groupId: formResponse.groupId||'',
  //   complete: formResponse.complete
  // };
  function set(input, value) {
    input.value = input.skipped
      ? process.env.T_REPORTING_MARK_SKIPPED_WITH
      : input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
        ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH 
        : value
  }
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      // Simplify the keys by removing formID.itemId
      let firstIdSegment = `${formID}_${item.id}_`
      let redactedValue;
      let valueOriginal = input.value
      let tagName = input.tagName
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for ≈ levels.
        // TANGY-LOCATION input creates a data structure like this:
        //[
        //   {
        //     "level": "county",
        //     "value": "county1"
        //   },
        //   {
        //     "level": "school",
        //     "value": "school1"
        //   }
        // ]
        valueOriginal = JSON.stringify(input.value)
        let locationValue = []
        for (let group of input.value) {
          let groupValueOriginal = group.value
          const len = groupValueOriginal.length
          let groupValue = rword.generate(1, {length: len});
          locationValue.push({"level": group.level, "value": groupValue})
          set(input, locationValue)
          redactedValue = JSON.stringify(locationValue)
        }
      } else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
        valueOriginal = input.value.find(input => input.value == 'on')
          ? input.value.find(input => input.value == 'on').name
          : ''
        const len = valueOriginal.length
        redactedValue = rword.generate(1, {length: len});
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-RADIO-BUTTON') {
        redactedValue = Math.random() <= 0.5;
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-CHECKBOXES') {
        valueOriginal = []
        redactedValue = []
        for (let checkboxInput of input.value) {
          valueOriginal.push(checkboxInput.value)
          const cbValue = Math.random() <= 0.5;
          checkboxInput.value = cbValue
          redactedValue.push(cbValue)
        }
        set(input, input.value)

      } else if (input.tagName === 'TANGY-CHECKBOX') {
        redactedValue = Math.random() <= 0.5;
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-BOX' || input.name === '') {
        // Do nothing :).
      } else if (input && typeof input.value === 'string') {
        const len = valueOriginal.length
        if (len > 0) {
          redactedValue = rword.generate(1, {length: len});
        }
        // try not to overwhelm console with signatures and other huge strings.
        valueOriginal = input.value.substring(0,20)
        set(input, redactedValue)
      } else if (input && typeof input.value === 'number') {
        // set(input, `${firstIdSegment}${input.name}`, input.value)
        const len = valueOriginal.toString().length;
        if (len > 0) {
          // making a guess here on the length, trying to increase randomness by adding 1 to length.
          redactedValue = randomFixedInteger(len + 1)
          set(input, redactedValue)
        }
      } else if (input && Array.isArray(input.value)) {
        // for (let group of input.value) {
        //   set(input, `${firstIdSegment}${input.name}${sep}${group.name}`, group.value)
        // }
        valueOriginal = JSON.stringify(input.value)
        redactedValue = []
        set(input,redactedValue)
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        // let elementKeys = Object.keys(input.value);
        // for (let key of elementKeys) {
        //   set(input, `${firstIdSegment}${input.name}${sep}${key}`, input.value[key])
        // };
        valueOriginal = JSON.stringify(input.value)
        redactedValue = {}
        set(input,redactedValue)
      }
      console.log("tagName: " + tagName + " name: " + input.name + " valueOriginal: " + valueOriginal + " redactedValue: " + redactedValue)
    }
  }
  return formResponse;
};

// kudos: https://stackoverflow.com/a/27725806
function randomFixedInteger(length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
}

function pushResponse(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(true))
          .catch(error => reject(`rshiny pushResponse could not overwrite ${doc._id} to ${db.name} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        const docClone = Object.assign({}, doc);
        // Make a clone of the doc so we can delete part of it but not lose it in other iterations of this code
        // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
        // delete the _rev property from the docClone
        delete docClone._rev
        db.put(docClone)
          .then(_ => resolve(true))
          .catch(error => reject(`rshiny pushResponse could not save ${docClone._id} to ${docClone.name} because Error of ${JSON.stringify(error)}`))
    });
  })
}

async function saveRedactedResponse(doc, locationList, targetDb, resolve) {
  if (doc.location) {
    doc.location = {
      "Region": "R1",
      "District": "D1"
    }
  }
  doc.startDatetime = null
  doc.startUnixtime = null
  doc.uploadDatetime = null
  doc.tangerineModifiedByUserId = null
  doc.tangerineModifiedByDeviceId = null
  doc.tangerineModifiedOn = null
  doc.deviceId = null
  doc.lastModified = null
  let redactedResponse = await generateRedactedResponse(doc, locationList);
  await pushResponse(redactedResponse, targetDb);
  resolve('done!')
}

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}
