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
              .catch(error => { console.log(error); reject(error); })
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
    if (doc.collection !== 'TangyFormResponse') return
    let formData = doc
    let formID = formData.form.id;
    let formHeaders = { _id: formID };
    let formResult = { _id: formData._id, formId: formID, startDatetime: formData.startDatetime };
    let locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))

    // generate column headers
    let docHeaders = generateHeaders(formData);
    docHeaders.push({ header: 'Complete', key: `${formID}.complete` });
    docHeaders.push({ header: 'Start Date Time', key: `${formID}.startDatetime` });
    formHeaders.columnHeaders = docHeaders;

    // process form result
    let processedResult = generateFlatObject(formData, locationList);
    formResult.processedResult = processedResult;
    formResult.processedResult[`${formID}.startDatetime`] = formData.startDatetime;
    formResult.processedResult[`${formID}.complete`] = formData.complete;
    await saveFormResponseHeaders(formHeaders, REPORTING_DB);
    await saveFlattenedFormResponse(formResult, REPORTING_DB);
  } catch (error) {
    throw new Error(`Could not process form repsonse because of Error of ${JSON.stringify(error)}`)
  }
};

/** This function generates headers for csv.
 *
 * @param {object} formData - form response from database
 *
 * @returns {array} generated headers for csv
 */

const generateHeaders = function (formData) {
  let formID = formData.form.id;
  let formResponseHeaders = [];
  formData.items.forEach(item => {
    item.inputs.forEach(input => {
      if (input && input.tagName === 'TANGY-LOCATION') {
        // Create columns for each level's ID and Label.
        input.value.forEach(group => {
          formResponseHeaders.push({
            header: `${input.name}_${group.level}`,
            key: `${formID}.${item.id}.${input.name}.${group.level}`
          });
        });
        input.value.forEach(group => {
          formResponseHeaders.push({
            header: `${input.name}_${group.level}_label`,
            key: `${formID}.${item.id}.${input.name}.${group.level}_label`
          });
        });
      } else if (input && (typeof input.value === 'string')) {
        formResponseHeaders.push({
          header: `${input.name}`,
          key: `${formID}.${item.id}.${input.name}`
        });
      } else if (input && Array.isArray(input.value)) {
        input.value.forEach(group => {
          formResponseHeaders.push({
            header: `${input.name}_${group.name}`,
            key: `${formID}.${item.id}.${input.name}.${group.name}`
          });
        });
      } else if (input && typeof input.value === 'object') {
        let elementKeys = Object.keys(input.value);
        elementKeys.forEach(key => {
          formResponseHeaders.push({
            header: `${input.name}_${key}`,
            key: `${formID}.${item.id}.${input.name}.${key}`
          });
        })
      }
    });
  });
  return formResponseHeaders;
}


/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs 
 *
 * @returns {object} processed results for csv
 */

const generateFlatObject = function (formData, locationList) {
  let formID = formData.form.id;
  let formResponseResult = {};
  for (let item of formData.items) {
    for (let input of item.inputs) {
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          locationKeys.push(group.value)
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.level}_label`] = getLocationLabel(locationKeys, locationList);
        }
      } else if (input && typeof input.value === 'string') {
        formResponseResult[`${formID}.${item.id}.${input.name}`] = input.value;
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.name}`] = group.value;
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          formResponseResult[`${formID}.${item.id}.${input.name}.${key}`] = input.value[key];
        };
      }
    }
  }
  return formResponseResult;
};


function saveFormResponseHeaders(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
      .then(async origDoc => {
        let newDoc = { _id: doc._id, _rev: origDoc._rev };
        let joinByHeader = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'header');
        let joinBykey = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'key');
        newDoc.columnHeaders = _.union(joinByHeader, joinBykey);
        db.put(newDoc)
          .then(() => resolve(true))
          .catch(error => {
            reject(`Could not save Form Response Headers ${newDoc._id} because Error of ${JSON.stringify(error)}`)
          })
      })
      .catch(async err => {
        db.put(doc)
          .then(() => resolve(true))
          .catch(err => {
            reject(`Could not save Form Response Headers ${JSON.stringify(doc._id)} because Error of ${JSON.stringify(err)}`)
          })
      })
  })
}

function saveFlattenedFormResponse(doc, db) {
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

function getLocationLabel(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return (currentLevel && currentLevel.hasOwnProperty('label')) ? currentLevel.label : ''
}

