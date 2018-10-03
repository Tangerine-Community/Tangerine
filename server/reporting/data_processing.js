/**
 * This file creates headers for CSV, processes the form response
 * and saves them into the result database.
 *
 *  Modules: generateHeaders, processFormResponse, saveProcessedFormData
 */


/**
 * Module dependencies.
 */

const PouchDB = require('pouchdb');
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const _ = require('lodash');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path')
const readFile = promisify(fs.readFile);
let DB = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  DB = PouchDB.defaults({
    prefix: process.env.T_COUCHDB_ENDPOINT
  });
} else {
  DB = PouchDB.defaults({
    prefix: '/tangerine/db/'
  });
}

// Function to pass to PouchDbChangesFeedWorker.
exports.changeProcessor = (change, sourceDb) => {
  return new Promise((resolve, reject) => {
    sourceDb.get(change.id)
      .then(doc => {
        switch (doc.collection) {
          case 'TangyFormResponse':
            processFormResponse(doc, sourceDb)
              .then(_ => resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name}))
              .catch(error => { reject(error) })
            break
          default:
            resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name})
        }
      })
      .catch(error => reject(new Error(error)))
  })
}

/** This function saves processed form response.
 *
 * @param {object} formData - form response from database
 * @param {string} resultDB - result database url
 *
 * @returns {object} - saved document
 */

const processFormResponse = async (doc, sourceDb) => {
  try {
    const REPORTING_DB = new DB(`${sourceDb.name}-reporting`);
    const GROUP_DB = sourceDb;
    const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
    const flatResponse = generateFlatResponse(doc, locationList);
    await saveFormInfo(flatResponse, REPORTING_DB);
    await saveFlatFormResponse(flatResponse, REPORTING_DB);
  } catch (error) {
    throw new Error(`Error processing doc ${doc._id} in db ${sourceDb.name}: ${JSON.stringify(error)}`)
  }
};

/** This function generates headers for csv.
 *
 * @param {object} formData - form response from database
 *
 * @returns {array} generated headers for csv
 */


/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs 
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = function (formResponse, locationList) {
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    startUnixtime: formResponse.startUnixtime,
    complete: formResponse.complete
  };
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          locationKeys.push(group.value)
          try {
            flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_label`] = getLocationLabel(locationKeys, locationList);
          } catch(e) {
            flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_label`] = 'orphaned';
          }
        }
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
      if (input.tagName === 'TANGY-TIMED') {
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
      }
    }
  }
  return flatFormResponse;
};

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
        formDoc.columnHeaders.push({ key, header: key })
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
    debugger
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

function getLocationLabel(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return (currentLevel && currentLevel.hasOwnProperty('label')) ? currentLevel.label : ''
}

