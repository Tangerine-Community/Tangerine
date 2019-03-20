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
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../modules/index.js')()

const CODE_SKIP = '999'

let DB = PouchDB.defaults({
  prefix: process.env.T_COUCHDB_ENDPOINT
});

// Function to pass to PouchDbChangesFeedWorker.
exports.changeProcessor = (change, sourceDb) => {
  return new Promise((resolve, reject) => {
    sourceDb.get(change.id)
      .then(doc => {
        switch (doc.collection) {
          case 'TangyFormResponse':
            if (process.env.T_PAID_ALLOWANCE !== 'unlimited' && !doc.paid) {
              resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name})
            } else {
              processFormResponse(doc, sourceDb)
                .then(_ => resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name}))
                .catch(error => { reject(error) })
            }
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
    const GROUP_DB = sourceDb;
    const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
    let flatResponse = await generateFlatResponse(doc, locationList);
    const hookResponse = await tangyModules.hook('reportingOutputs', {flatResponse, doc, sourceDb})
  } catch (error) {
    throw new Error(`Error processing doc ${doc._id} in db ${sourceDb.name}: ${JSON.stringify(error,replaceErrors)}`)
  }
};

function replaceErrors(key, value) {
  if (value instanceof Error) {
    var error = {};
    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = value[key];
    });
    return error;
  }
  return value;
}

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
  let data = await tangyModules.hook("flatFormReponse", {flatFormResponse, formResponse});
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
