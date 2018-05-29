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
  let docHeaders = generateHeadersFromFormResponse(formData);
  docHeaders.push({ header: 'Complete', key: `${formID}.complete` });
  docHeaders.push({ header: 'Start Date Time', key: `${formID}.startDatetime` });
  formHeaders.columnHeaders = docHeaders;

  // process form result
  let processedResult = generateFlatObjectFromFormResponse(formData, locationList);
  formResult.processedResult = processedResult;
  formResult.processedResult[`${formID}.startDatetime`] = formData.startDatetime;
  formResult.processedResult[`${formID}.complete`] = formData.complete;

  try {
    await saveFormResponseHeaders(formHeaders, REPORTING_DB);
  } catch (err) {
    console.error(err);
  }

  try {
    await saveFlattenedFormResponse(formResult, REPORTING_DB);
  } catch (err) {
    console.error(err);
  }

};

/** This function generates headers for csv.
 *
 * @param {object} formData - form response from database
 *
 * @returns {array} generated headers for csv
 */

const generateHeadersFromFormResponse = function (formData) {
  let formID = formData.form.id;
  let formResponseHeaders = [];

  formData.items.forEach(item => {
    item.inputs.forEach(input => {
      // create headers for all values that are strings
      if (input && (typeof input.value === 'string')) {
        formResponseHeaders.push({
          header: `${input.name}`,
          key: `${formID}.${item.id}.${input.name}`
        });
      }

      // create headers for all values that are arrays
      if (input && Array.isArray(input.value)) {
        //@TODO: Remove this if-block when tangy-location follows the name and value data structure.
        if (input.tagName === 'TANGY-LOCATION') {
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
        } else {
          input.value.forEach(group => {
            formResponseHeaders.push({
              header: `${input.name}_${group.name}`,
              key: `${formID}.${item.id}.${input.name}.${group.name}`
            });
          });
        }
      }

      // create headers for all values that are pure objects
      if (input && (typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        elementKeys.forEach(key => {
          formResponseHeaders.push({
            headers: `${input.name}_${key}`,
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

const generateFlatObjectFromFormResponse = function (formData, locationList) {
  let formID = formData.form.id;
  let formResponseResult = {};

  for (let item of formData.items) {
    for (let input of item.inputs) {
      // TANGY-LOCATION has it's own custom format.
      if (input.tagName === 'TANGY-LOCATION') {
        locationKeys = []
        for (let group of input.value) {
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          locationKeys.push(group.value)
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.level}_label`] = getLocationLabel(locationKeys, locationList);
        }
      // Case for inputs that have string values.
      } else if (input && typeof input.value === 'string') {
        formResponseResult[`${formID}.${item.id}.${input.name}`] = input.value;
      // Case for inputs whos value are arrays of objects following the name/value property convention.
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          formResponseResult[`${formID}.${item.id}.${input.name}.${group.name}`] = group.value;
        }
      // Case for Object following the name/value property convention.
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
        console.log(err.message, '...Retry saving header');
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
        console.log(err.message, '...Retry saving result');
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

exports.processFormResponse = processFormResponse;
