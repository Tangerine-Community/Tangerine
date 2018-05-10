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
  let formResponseHeaders = [];

  formData.items.forEach(data => {
    data.inputs.forEach(item => {
      let formTitle = data.title.trim().replace(/\s/g, '_');

      // create headers for all values that are strings
      if (typeof (item && item.value) === 'string') {
        formResponseHeaders.push({
          header: `${formTitle}_${item.name}`,
          key: `${formData.form.id}.${formTitle}.${item.name}`
        });
      }

      // create headers for all values that are arrays
      if (Array.isArray(item.value)) {
        if (item.tagName === 'TANGY-LOCATION') {
          item.value.forEach(group => {
            formResponseHeaders.push({
              header: `${formTitle}_${item.name}_${group.level}`,
              key: `${formData.form.id}.${formTitle}.${item.name}.${group.level}`
            });
          });
        } else {
          item.value.forEach(group => {
            formResponseHeaders.push({
              header: `${formTitle}_${item.name}_${group.name}`,
              key: `${formData.form.id}.${formTitle}.${item.name}.${group.name}`
            });
          });
        }
      }

      // create headers for all values that are pure objects
      if (typeof (item && item.value) === 'object' && !Array.isArray(item && item.value) && (item && item.value) !== null) {
        let elementKeys = Object.keys(item.value);
        elementKeys.forEach(key => {
          formResponseHeaders.push({
            headers: `${formTitle}_${item.name}_${key}`,
            key: `${formData.form.id}.${formTitle}.${item.name}.${key}`
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

  formData.items.forEach(data => {
    data.inputs.forEach(item => {
      let formTitle = data.title.trim().replace(/\s/g, '_');

      // create headers for all values that are strings
      if (typeof (item && item.value) === 'string') {
        formResponseResult[`${formID}.${formTitle}.${item.name}`] = item.value;
      }

      // create headers for all values that are arrays
      if (Array.isArray(item.value)) {
        if (item.tagName === 'TANGY-LOCATION') {
          item.value.forEach(group => {
            formResponseResult[`${formID}.${formTitle}.${item.name}.${group.level}`] = group.value;
          });
        } else {
          item.value.forEach(group => {
            formResponseResult[`${formID}.${formTitle}.${item.name}.${group.name}`] = group.value;
          });
        }
      }

      // create headers for all values that are pure objects
      if (typeof (item && item.value) === 'object' && !Array.isArray(item && item.value) && (item && item.value) !== null) {
        let elementKeys = Object.keys(item.value);
        elementKeys.forEach(key => {
          formResponseResult[`${formID}.${formTitle}.${item.name}.${key}`] = item.value[key];
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
  formHeaders.columnHeaders = docHeaders;

  // process form result
  let processedResult = processFormResponse(formData);
  formResult.processedResult = processedResult;
  formResult.processedResult[`${formID}.startDatetime`] = formData.startDatetime;
  formResult.processedResult[`${formID}.complete`] = formData.complete;

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
  db.get(doc._id).then(origDoc => {
    let newDoc = { _rev: origDoc._rev };
    let joinBykey = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'key');
    let joinByHeader = _.unionBy(origDoc.columnHeaders, doc.columnHeaders, 'header');
    newDoc.columnHeaders = _.union(joinByHeader, joinBykey);
    return db.put(newDoc, { force: true });
  })
  .catch(err => {
    if (err.status === 409) {
      return saveFormHeaders(doc);
    } else {
      return db.put(doc); // save new doc
    }
  });
}

function saveFormResult(doc, db) {
  db.get(doc._id).then(oldDoc => {
    let newDoc = _.merge(oldDoc, doc);
    return db.put(newDoc, { force: true });
  }).catch(err => {
    if (err.status === 409) {
      console.log(err.message, '...Retry saving result');
      return saveFormResult(doc);
    } else {
      return db.put(doc); // save new doc
    }
  });
}

exports.generateHeaders = generateHeaders;

exports.processFormResponse = processFormResponse;

exports.saveProcessedFormData = saveProcessedFormData;
