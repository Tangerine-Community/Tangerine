/**
 * This file is a collection of helper functions for database queries.
*/

/**
 * Module dependencies.
 */

const _ = require('lodash');
const nano = require('nano');

/**
 * This function retrieves all assessment collections in the database.
 *
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} – all assessment documents.
 */

exports.getAllAssessment = (dbUrl) => {
  let BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'byCollection', {
      key: 'assessment',
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body.rows);
      }
    });
  });
}

/**
 * This function retrieves all curriculum collections in the database.
 *
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} – all curriculum documents.
 */

exports.getAllCurriculum = (dbUrl) => {
  let BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'byCollection', {
      key: 'curriculum',
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body.rows);
      }
    });
  });
}

/**
 * This function retrieves all workflow collections in the database.
 *
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} – all workflow documents.
 */

exports.getAllWorkflow = (dbUrl) => {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'byCollection', {
      key: 'workflow',
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body.rows);
      }
    });
  });
}

/**
 * This function retrieves all result collections in the database.
 *
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} – all result documents.
 */

exports.getAllResult = (dbUrl) => {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'csvRows', {
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        let resultCollection = _.map(body.rows, (data) => data.doc);
        resolve(resultCollection);
      }
    });
  });
}

/**
 * This function retrieves a document from the database.
 *
 * @param {string} docId - id of document.
 * @param {string} dbUrl - database url.
 *
 * @returns {Object} - retrieved document.
 */

exports.retrieveDoc = (docId, dbUrl) => {
  const DB = nano(dbUrl);
  return new Promise ((resolve, reject) => {
    DB.get(docId, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body);
      }
    });
  });
}

/**
 * This function saves/updates generated headers in the result database.
 *
 * @param {Array} doc - document to be saved.
 * @param {string} key - key for indexing.
 * @param {string} dbUrl - url of the result database.
 *
 * @returns {Object} - saved document.
 */

exports.saveHeaders = (doc, key, dbUrl) => {
  const RESULT_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    RESULT_DB.get(key, (error, existingDoc) => {
      let docObj = { column_headers: doc };
      docObj.updated_at = new Date().toISOString();

      // if doc exists update it using its revision number.
      if (!error) {
        docObj = _.assignIn(existingDoc, docObj);
      }
      RESULT_DB.insert(docObj, key, (err, body) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(body);
        }
      });
    });
  });
}

/**
 * This function saves/updates processed result in the result database.
 *
 * @param {Object} doc - document to be saved.
 * @param {string} key - key for indexing.
 * @param {string} dbUrl - url of the result database.
 *
 * @returns {Object} - saved document.
 */

exports.saveResult = (doc, dbUrl) => {
  const RESULT_DB = nano(dbUrl);
  const cloneDoc = _.clone(doc);
  let docKey = cloneDoc.indexKeys.ref;
  delete doc.indexKeys;

  let docObj = {
    updated_at: new Date().toISOString(),
    parent_id: cloneDoc.indexKeys.parent_id,
    result_time : cloneDoc.indexKeys.time,
    result_day : cloneDoc.indexKeys.day,
    result_month: cloneDoc.indexKeys.month,
    result_year: cloneDoc.indexKeys.year,
    processed_results: doc
  };

  return new Promise((resolve, reject) => {
    RESULT_DB.get(docKey, (error, existingDoc) => {
      // if doc exists update it using its revision number.
      if (!error) {
        docObj = _.assignIn(existingDoc, docObj);
      }
      RESULT_DB.insert(docObj, docKey, (err, body) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(body);
        }
      });
    });
  });
}

/**
 * This function retrieves all subtest linked to an assessment.
 *
 * @param {string} id - id of assessment document.
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} - subtest documents.
 */

exports.getSubtests = (id, dbUrl) => {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'subtestsByAssessmentId', {
      key: id,
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      if (body && body.rows) {
        let subtestDoc = _.map(body.rows, (data) => data.doc);
        let orderedSubtests = _.sortBy(subtestDoc, ['assessmentId', 'order']);
        resolve(orderedSubtests);
      }
      else {
        resolve(body);
      }
    })
  });
}

/**
 * This function retrieves all questions linked to a subtest document.
 *
 * @param {string} subtestId - id of subtest document.
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} - question documents.
 */

exports.getQuestionBySubtestId = (subtestId, dbUrl) => {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('ojai', 'questionsByParentId', {
      key: subtestId,
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        let doc = _.map(body.rows, (data) => data.doc);
        resolve(doc);
      }
    });
  });
}

/**
 * This function retrieves all processed result for a given document id
 *
 * @param {string} ref - id of document.
 * @param {string} dbUrl - result database url.
 *
 * @returns {Array} - result documents.
 */

exports.getProcessedResults = function (ref, dbUrl) {
  const RESULT_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    RESULT_DB.view('dashReporting', 'byParentId', {
      key: ref,
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body.rows);
      }
    });
  });
}

/**
 * This function retrieves a result document.
 *
 * @param {string} id - trip id of document.
 * @param {string} dbUrl - base database url.
 *
 * @returns {Array} - result documents.
 */

exports.getResults = function(id, dbUrl) {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.view('dashReporting', 'byTripId', {
      key: id,
      include_docs: true
    }, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body.rows);
      }
    });
  });
}

exports.checkUpdateSequence = (dbUrl) => {
  const DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    DB.get('last_update_sequence', (err, obj) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(obj);
      }
    });
  });
};

exports.saveUpdateSequence = (dbUrl, doc) => {
  const DB = nano(dbUrl)
  return new Promise((resolve, reject) => {
    DB.get(doc.key, (error, seqDoc) => {
      if (!error) {
        doc._rev = seqDoc._rev;
      }
      DB.insert(doc, doc.key, (err, body) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(body);
        }
      });
    });
  });
};

exports.processedResultsById = function (req, res) {
  const RESULT_DB = nano(req.body.result_db);
  RESULT_DB.view('dashReporting', 'byParentId', {
    key: req.params.id,
    include_docs: true
  }, (err, body) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(body.rows);
    }
  });
}


/**
 * @description – This function retrieves enumerator information.
 *
 * @param {string} enumerator - name of the enumerator.
 * @param {string} dbUrl - base database url.
 *
 * @returns {Object} - user document.
 */

exports.getUserDetails = function (enumerator, dbUrl) {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.get(enumerator, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body);
      }
    });
  });
}

/**
 * @description – This function retrieves location list
 *
 * @param {string} dbUrl - base database url.
 *
 * @returns {Object} - location document.
 */

exports.getLocationList = function (dbUrl) {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.get('location-list', (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body);
      }
    });
  });
}


exports.getSettings = function (dbUrl) {
  const BASE_DB = nano(dbUrl);
  return new Promise((resolve, reject) => {
    BASE_DB.get('settings', (err, body) => {
      if(err)
        reject(err)
      else
        resolve(body);
    });
  });
}
