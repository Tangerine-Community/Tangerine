const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const groupReportingViews = require(`./views.js`)
const insertGroupReportingViews = require(`../../insert-group-reporting-views.js`)
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()
const CODE_SKIP = '999'

module.exports = {
  hooks: {
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        const db = DB(`${groupName}-reporting`)
        await db.destroy()
        await insertGroupReportingViews(groupName)
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
        try {
          const {doc, sourceDb} = data
          const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
          let flatResponse = await generateFlatResponse(doc, locationList);
          // Process the flatResponse
          // @TODO Rename `-reporting` to `-csv`.
          const REPORTING_DB = new DB(`${sourceDb.name}-reporting`);
          // @TODO Ensure design docs are in the database.
          await saveFormInfo(flatResponse, REPORTING_DB);
          await saveFlatFormResponse(flatResponse, REPORTING_DB);
          // Index the view now.
          await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
        } catch(e) { reject(e) }
      })
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        let designDoc = Object.assign({}, groupReportingViews)
        let groupDb = new DB(`${groupName}-reporting`)
        try {
          let status = await groupDb.post(designDoc)
          log.info(`group reporting views inserted into ${groupName}-reporting`)
        } catch (error) {
          log.error(error)
        }
        resolve(data)
      })
    }
  }
}

/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, locationList) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    startUnixtime: formResponse.startUnixtime,
    complete: formResponse.complete
  };
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      if (input.hidden || item.disabled) {
        // If the input is disabled or hidden, or the the item is disabled, set SKIP code.
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = CODE_SKIP
      } else if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          locationKeys.push(group.value)
          try {
            const location = getLocationByKeys(locationKeys, locationList)
            for (let keyName in location) {
              if (keyName !== 'children') {
                flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_${keyName}`] = location[keyName]
              }
            }
          } catch(e) {
            flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_label`] = 'orphaned';
          }
        }
      } else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = input.value.find(input => input.value == 'on')
          ? input.value.find(input => input.value == 'on').name
          : ''
      } else if (input.tagName === 'TANGY-CHECKBOXES') {
        for (let checkboxInput of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}_${checkboxInput.name}`] = checkboxInput.value
            ? "1"
            : "0"
        };
      } else if (input.tagName === 'TANGY-TIMED') {
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
          flatFormResponse[`${formID}.${item.id}.${input.name}_${toggleInput.name}`] = derivedValue
          if (toggleInput.highlighted === true) {
            hitLastAttempted = true
          }
        };
        flatFormResponse[`${formID}.${item.id}.${input.name}.duration`] = input.duration
        flatFormResponse[`${formID}.${item.id}.${input.name}.time_remaining`] = input.timeRemaining
        // Calculate Items Per Minute.
        let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
        let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
        let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
        flatFormResponse[`${formID}.${item.id}.${input.name}.number_of_items_correct`] = numberOfItemsCorrect
        flatFormResponse[`${formID}.${item.id}.${input.name}.number_of_items_attempted`] = numberOfItemsAttempted
        let timeSpent = input.duration - input.timeRemaining
        flatFormResponse[`${formID}.${item.id}.${input.name}.items_per_minute`] = Math.round(numberOfItemsCorrect / (timeSpent / 60))
      } else if (input.tagName === 'TANGY-BOX' || input.name === '') {
        // Do nothing :).
      } else if (input && typeof input.value === 'string') {
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = input.value;
      } else if (input && typeof input.value === 'number') {
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = input.value;
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${group.name}`] = group.value;
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${key}`] = input.value[key];
        };
      }

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
        formDoc.columnHeaders.push({ key, header: safeKey.substr(secondOccurenceIndex+1, safeKey.length) })
        foundNewHeaders = true
      }
    })
    if (foundNewHeaders) {
      try {
        await db.put(formDoc)
      } catch(err) {
        log.error(err)
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
