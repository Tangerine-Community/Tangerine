/**
 * This file is a collection of helper functions for database queries.
*/

/**
 * Module dependencies.
 */

const _ = require('lodash');
const PouchDB = require('pouchdb');


/**
 * @description This function saves/updates generated headers in the result database.
 *
 * @param {Array} doc - document to be saved.
 *
 * @returns {Object} - saved document.
 */

exports.saveHeaders = async (doc, key, resultDb) => {
  const RESULT_DB = new PouchDB(resultDb);
  let docObj = {
    _id: key,
    name: doc.shift(),
    updated_at: new Date().toISOString(),
    column_headers: doc
  };

  try {
    let existingDoc = await RESULT_DB.get(key);
    if (!existingDoc.error) {
      let docHeaders = _.unionBy(existingDoc.column_headers, docObj.column_headers, 'header');
      docObj.column_headers = docHeaders;
      docObj._rev = existingDoc._rev;
    }
  } catch (error) {
    console.log('Could not find header document with key: ' + key);
  }

  try {
    return await RESULT_DB.put(docObj, { force: true });
  } catch (err) {
    console.error({ message: 'Could not save generated headers', reason: err.message });
  }
}

/**
 * @description This function saves/updates processed result in the result database.
 *
 * @param {Object} doc - document to be saved.
 *
 * @returns {Object} - saved document.
 */

exports.saveResult = async (doc, resultDb) => {
  const RESULT_DB = new PouchDB(resultDb);
  const cloneDoc = _.clone(doc);
  let docKey = cloneDoc.indexKeys.ref;
  delete doc.indexKeys;

  let docObj = {
    _id: docKey,
    updated_at: new Date().toISOString(),
    parent_id: cloneDoc.indexKeys.parent_id,
    result_time : cloneDoc.indexKeys.time,
    result_day : cloneDoc.indexKeys.day,
    result_month: cloneDoc.indexKeys.month,
    result_year: cloneDoc.indexKeys.year,
    processed_results: doc
  };

  try {
    let existingDoc = await RESULT_DB.get(docKey);
    // if doc exists update it using its revision number.
    if (!existingDoc.error) {
      docObj = _.merge(existingDoc, docObj);
    }
  } catch (error) {
    console.log('Could not find result document with key: ' + docKey);
  }

  try {
    return await RESULT_DB.put(docObj, { force: true });
  } catch (err) {
    console.error({ message: 'Could not save processed results', reason: err.message });
  }
}

/**
 * @description This function retrieves all subtest linked to an assessment.
 *
 * @param {string} id - id of assessment document.
 *
 * @returns {Array} - subtest documents.
 */

exports.getSubtests = (id, baseDb) => {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.query('ojai/subtestsByAssessmentId', { key: id, include_docs: true })
      .then((body) => {
        if (body && body.rows) {
          let subtestDoc = _.map(body.rows, (data) => data.doc);
          let orderedSubtests = _.sortBy(subtestDoc, ['assessmentId', 'order']);
          resolve(orderedSubtests);
        }
        resolve(body);
      }).catch((err) => reject(err));
  });
}

/**
 * @description This function retrieves all questions linked to a subtest document.
 *
 * @param {string} subtestId - id of subtest document.
 *
 * @returns {Array} - question documents.
 */

exports.getQuestionBySubtestId = (subtestId, baseDb) => {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.query('ojai/questionsByParentId',{ key: subtestId, include_docs: true })
      .then((body) => {
        let doc = _.map(body.rows, (data) => data.doc);
        resolve(doc);
      }).catch((err) => reject(err));
  });
}

/**
 * @description This function retrieves all processed result for a given document id
 *
 * @param {string} ref - id of document.
 *
 * @returns {Array} - result documents.
 */

exports.getProcessedResults = function (ref, resultDb) {
  const RESULT_DB = new PouchDB(resultDb);
  return new Promise((resolve, reject) => {
    RESULT_DB.query('dashReporting/byParentId', { key: ref, include_docs: true })
      .then((body) => resolve(body.rows))
      .catch((err) => reject(err));
  });
}

/**
 * @description This function retrieves all result documents with the same tripId.
 *
 * @param {string} id - trip id of document.
 *
 * @returns {Array} - result documents.
 */

exports.getTripResults = function(id, baseDb) {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.query('dashReporting/byTripId', { key: id, include_docs: true })
      .then((body) => resolve(body.rows))
      .catch((err) => reject(err));
  });
}

/**
 * @description – This function retrieves all processed results with the same parentId.
 *
 * @param {string} id - parent id of document.
 *
 * @returns {Array} - location document.
 */
exports.processedResultsById = function (req, res) {
  const RESULT_DB = new PouchDB(req.body.result_db);
  RESULT_DB.query('dashReporting/byParentId', { key: req.params.id, include_docs: true })
    .then((body) => res.json(body.rows))
    .catch((err) => res.send(err));
}

/**
 * @description – This function retrieves enumerator information.
 *
 * @param {string} enumerator - name of the enumerator.
 *
 * @returns {Object} - user document.
 */

exports.getUserDetails = function (enumerator, baseDb) {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.get(enumerator)
      .then((body) => resolve(body))
      .catch((err) => reject(err));
  });
}

/**
 * @description – This function retrieves location list
 *
 * @returns {Object} - location document.
 */

exports.getLocationList = function (baseDb) {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.get('location-list')
      .then((body) => resolve(body))
      .catch((err) => reject(err));
  });
}

/**
 * @description – This function retrieves the global settings of the instrument.
 *
 * @returns {Object} - settings document.
 */
exports.getSettings = function (baseDb) {
  const GROUP_DB = new PouchDB(baseDb);
  return new Promise((resolve, reject) => {
    GROUP_DB.get('settings')
      .then((body) => resolve(body))
      .catch((err) => reject(err));
  });
}
