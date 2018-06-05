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
const log = require('tangy-log').log
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
  return new Promise(async (res, rej) => {
    let doc = await sourceDb.get(change.id).catch(err => log.error(err))
    switch (doc.collection) {
      case 'TangyFormResponse':
        log.info(`Processing ${doc._id} for db ${sourceDb.name}`)
        await processFormResponse(doc, sourceDb).catch(err => log.error(err))
        return res({status: 'ok', seq: change.seq, dbName: sourceDb.name})
    }
    log.warn(`A doc not of type TangyFormResponse found with _id of ${doc._id}`)
    return res({status: 'ok', seq: change.seq, dbName: sourceDb.name})

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
  } catch (err) {
    log.error(`Error: ${err} processing doc ${doc._id} in database ${sourceDb.name}`);
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
  /**
   * find document by id.
   * if found update revision number and column headers
   * else save document as new doc
   */
  return new Promise((res, rej) => {
    db.get(doc._id).then(async origDoc => {
      let newDoc = { _id: doc._id, _rev: origDoc._rev };
      let joinByHeader = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'header');
      let joinBykey = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'key');
      newDoc.columnHeaders = _.union(joinByHeader, joinBykey);
      await db.put(newDoc).catch(err => log.error(err));
      res(true)
    })
    .catch(async err => {
      if (err.status === 409) {
        // For document update conflict retry saving the header.
        await saveFormHeaders(doc);
        res(true)
      } else {
        await db.put(doc).catch(err => log.error(err)); // save new doc
        res(true)
      }
    });
  })
}

function saveFlattenedFormResponse(doc, db) {
  /**
   * find document by id.
   * if found update revision number and column headers
   * else save document as new doc
   */
  return new Promise((res, rej) => {
    db.get(doc._id).then(async oldDoc => {
      let updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
      await db.put(updatedDoc);
      res(true)
    }).catch(async err => {
      await db.put(doc).catch(err => log.error(err)); // save new doc
      res(true)
    });
  })
}

function getLocationLabel(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  if (!currentLevel) log.warn(`No level found. keys: ${JSON.stringify(keys)}`)
  return (currentLevel && currentLevel.hasOwnProperty('label')) ? currentLevel.label : ''
}

