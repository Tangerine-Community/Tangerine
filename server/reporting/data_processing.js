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
const readFile = promisify(fs.readFile);
const log = require('tangy-log').log
const clog = require('tangy-log').clog

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

// Passes off a change to the corresponding chache processing function. Returns a promise.
function processChange(change, dbName) {
  switch (change.doc.collection) {
    case 'TangyFormRespone':
      return processFormResponse(doc, dbName)
  }
}

async function processBatch(dbCacheEntries, batchSize) {
  let batchDidRun = false 
  const dbNames = DB.allDbs().filter(dbName => dbName.indexOf('-result') === -1)
  for (let dbName of dbNames) {
    let dbCacheEntry = dbCacheEntries(cache => cache.dbName === dbName)
    if (dbCacheEntry) {
      dbCacheEntries.push({ dbName, sequence: 0 })
      dbCacheEntry = dbCacheEntries(cache => cache.dbName === dbName)
    }
    const STORE = new DB(dbName);
    // Include docs so we don't have to make additional requests to the db. This is ok as long as we don't end up getting backed up, which this shouldn't.
    const changes = STORE.changes({ since: dbCacheEntry.sequence, limit: batchSize, include_docs: true })
    const batch = changes.map(change => processChange(change, dbName))
    await Promise.all(batch)
    dbCacheEntry.sequence = changes[changes.length-1].sequence
  }
  return {
    batchDidRun,
    queues
  }
}

exports.startCacheProcessing = function() {
  var batchIsRunning = false
  // @TODO Load this from a persistent store so we don't process from sequence 0 for every database everytime we start.
  var queues = []
  var batchSize = 5
  // Keep the cache processing alive.
  // Could be an infinite while statement, but this is easier on CPUs.
  return setInterval(async () => {
    // Semaphore for preventing parallel cache processes from running.
    if (batchIsRunning === true) return
    batchIsRunning = true
    batchStatus = await processBatch(cacheEntries, batchSize)
    // Sleep if there was not a batch to process. All is quiet.
    if (!batchStatus.batchDidRun === false) {
      setTimeout(() => batchIsRunning = false, 10*1000)
    } else {
      batchIsRunning = false
    }
  }, 100)
}


/** This function saves processed form response.
 *
 * @param {object} formData - form response from database
 * @param {string} resultDB - result database url
 *
 * @returns {object} - saved document
 */

const processFormResponse = async function (formData, groupName) {
  const REPORTING_DB = new DB(`${groupName}-reporting`);
  let formID = formData.form.id;
  let formHeaders = { _id: formID };
  let formResult = { _id: formData._id, formId: formID, startDatetime: formData.startDatetime };
  let locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${groupName}/location-list.json`))

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

  try {
    await saveFormResponseHeaders(formHeaders, REPORTING_DB);
  } catch (err) {
    log.error(err);
  }

  try {
    await saveFlattenedFormResponse(formResult, REPORTING_DB);
  } catch (err) {
    log.error(err);
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
      await db.put(newDoc);
      res(true)
    })
    .catch(async err => {
      if (err.status === 409) {
        // For document update conflict retry saving the header.
        clog(err.message, '...Retry saving header');
        await saveFormHeaders(doc);
        res(true)
      } else {
        await db.put(doc); // save new doc
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
      let newDoc = _.merge(oldDoc, doc);
      await db.put(newDoc);
      res(true)
    }).catch(async err => {
      if (err.status === 409) {
        // For document update conflict retry saving the result.
        log.error(err.message, '...Retry saving result');
        await saveFormResult(doc);
        res(true)
      } else {
        await db.put(doc); // save new doc
        res(true)
      }
    });
  })
}

function getLocationLabel(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel.label
}

