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
      // create headers for all values that are strings
      if (input && (typeof input.value === 'string')) {
        formResponseHeaders.push({
          header: `${item.id}_${input.name}`,
          key: `${formID}.${item.id}.${input.name}`
        });
      }

      // create headers for all values that are arrays
      if (input && Array.isArray(input.value)) {
        //@TODO: Remove this if-block when tangy-location follows the name and value data structure.
        if (input.tagName === 'TANGY-LOCATION') {
          input.value.forEach(group => {
            formResponseHeaders.push({
              header: `${item.id}_${input.name}_${group.level}`,
              key: `${formID}.${item.id}.${input.name}.${group.level}`
            });
          });
        } else {
          input.value.forEach(group => {
            formResponseHeaders.push({
              header: `${item.id}_${input.name}_${group.name}`,
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
            headers: `${item.id}_${input.name}_${key}`,
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
 *
 * @returns {object} processed results for csv
 */

const processFormResponse = function (formData) {
  let formID = formData.form.id;
  let formResponseResult = {};

  formData.items.forEach(item => {
    item.inputs.forEach(input => {
      // create headers for all values that are strings
      if (input && typeof input.value === 'string') {
        formResponseResult[`${formID}.${item.id}.${input.name}`] = input.value;
      }

      // create headers for all values that are arrays
      if (input && Array.isArray(input.value)) {
        //@TODO: Remove this if-block when tangy-location follows the name and value data structure.
        if (input.tagName === 'TANGY-LOCATION') {
          input.value.forEach(group => {
            formResponseResult[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          });
        } else {
          input.value.forEach(group => {
            formResponseResult[`${formID}.${item.id}.${input.name}.${group.name}`] = group.value;
          });
        }
      }

      // create headers for all values that are pure objects
      if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        elementKeys.forEach(key => {
          formResponseResult[`${formID}.${item.id}.${input.name}.${key}`] = input.value[key];
        });
      }

    });

  });

  return formResponseResult;
};


/** This function saves processed form response.
 *
 * @param {object} formData - form response from database
 * @param {string} resultDB - result database url
 *
 * @returns {object} - saved document
 */

const saveProcessedFormData = async function (formData, resultDB) {
  const RESULT_DB = new DB(resultDB);
  let formID = formData.form.id;
  let formHeaders = { _id: formID };
  let formResult = { _id: formData._id, formId: formID, startDatetime: formData.startDatetime };

  // generate column headers
  let docHeaders = generateHeaders(formData);
  docHeaders.push({ headers: 'Complete', key: `${formID}.complete` });
  docHeaders.push({ headers: 'Start Date Time', key: `${formID}.startDatetime` });
  formHeaders.column_headers = docHeaders;

  // process form result
  formResult.processed_results = processFormResponse(formData);
  formResult.processed_results[`${formID}.startDatetime`] = formData.startDatetime;
  formResult.processed_results[`${formID}.complete`] = formData.complete;

  try {
    await saveFormHeaders(formHeaders, RESULT_DB);
  } catch (err) {
    console.error(err);
  }

  try {
    await saveFormResult(formResult, RESULT_DB);
  } catch (err) {
    console.error(err);
  }

};

function saveFormHeaders(doc, db) {
  /**
   * find document by id.
   * if found update revision number and column headers
   * else save document as new doc
   */
  return new Promise((res, rej) => {
    db.get(doc._id).then(async origDoc => {
      let newDoc = { _id: doc._id, _rev: origDoc._rev };
      let joinByHeader = _.unionBy(origDoc.column_headers, doc.column_headers, 'header');
      let joinBykey = _.unionBy(origDoc.column_headers, doc.column_headers, 'key');
      newDoc.column_headers = _.union(joinByHeader, joinBykey);
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

function saveFormResult(doc, db) {
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

exports.generateHeaders = generateHeaders;

exports.processFormResponse = processFormResponse;

exports.saveProcessedFormData = saveProcessedFormData;
