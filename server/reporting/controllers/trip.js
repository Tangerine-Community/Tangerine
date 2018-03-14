/**
 * This file processes the result of a workflow.
 * It also exposes the processWorkflowResult module.
 */

/**
 * Module dependencies.
 */

const _ = require('lodash');
const PouchDB = require('pouchdb');

/**
 * Local dependencies.
 */

const generateResult = require('./result').generateResult;
const validateResult = require("./result").validateResult;
const dbQuery = require('./../utils/dbQuery');

/**
 * Processes result for a workflow.
 *
 * Example:
 *
 *    POST /workflow/result/:id
 *  where id refers to the id of the workflow document.
 *
 *  The request object must contain the main database url and a
 *  result database url where the generated headers will be saved.
 *     {
 *       "db_url": "http://admin:password@test.tangerine.org/database_name"
 *       "another_db_url": "http://admin:password@test.tangerine.org/result_database_name"
 *     }
 *
 * Response:
 *
 *   Returns an Object indicating the data has been saved.
 *      {
 *        "ok": true,
 *        "id": "a1234567890",
 *        "rev": "1-b123"
 *       }
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.processResult = (req, res) => {
  const baseDb = req.body.base_db;
  const resultDb = req.body.result_db;

  dbQuery.getTripResults(req.params.id)
    .then(async(data) => {
      let totalResult = {};
      const result = await processWorkflowResult(data, baseDb);
      const saveResponse = await dbQuery.saveResult(totalResult, resultDb);
      console.log(saveResponse);
      res.json(totalResult);
    })
    .catch((err) => res.send(err));
}


/*****************************
 *     APPLICATION MODULE    *
 *****************************
 */


/**
 * This function processes the result for a workflow.
 *
 * @param {Array} data - an array of workflow results.
 *
 * @returns {Object} - processed result for csv.
 */

const processWorkflowResult = function (data, baseDb) {
  const tripPromise = () => data.map((item, index) => {
    let itemId = item.doc.workflowId || item.doc.assessmentId || item.doc.curriculumId;
    if (itemId != undefined) {
      return generateResult(item, index, dbUrl);
    }
  });

  // Processing trip results and validate them
  return Promise.all(tripPromise()).then(async body => {
    let totalResult = {};
    let result = { indexKeys: {} };
    let docId = body[0].indexKeys.collectionId;
    let groupTimeZone = body[0].indexKeys.groupTimeZone;

    let allTimestamps = _.chain(body)
      .map(el => el && el.indexKeys.timestamps)
      .filter(val => val != null || undefined)
      .flatten()
      .sortBy()
      .value();

    // Validate result from all subtest timestamps
    let validationData = await validateResult(docId, groupTimeZone, dbUrl, allTimestamps);
    result.isValid = validationData.isValid;
    result.isValidReason = validationData.reason;
    result[`${docId}.start_time`] = validationData.startTime;
    result[`${docId}.end_time`] = validationData.endTime;

    result.indexKeys.ref = body[0].indexKeys.ref;
    result.indexKeys.parent_id = docId;
    result.indexKeys.year = validationData.indexKeys.year;
    result.indexKeys.month = validationData.indexKeys.month;
    result.indexKeys.day = validationData.indexKeys.day;

    body.push(result);
    body.forEach(element => (totalResult = Object.assign(totalResult, element)));

    return totalResult;
  });
}

exports.processWorkflowResult = processWorkflowResult;
