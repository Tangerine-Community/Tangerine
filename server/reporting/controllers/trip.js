/**
 * This file processes the result of a workflow.
 * It also exposes the processWorkflowResult module.
 */

/**
 * Module dependencies.
 */

const _ = require('lodash');
const PouchDB = require('pouchdb');
const Promise = require('bluebird');

/**
 * Local dependencies.
 */

const generateResult = require('./result').generateResult;
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
      result.forEach(element => totalResult = Object.assign(totalResult, element));
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
  return Promise.map(data, (item, index) => {
    return generateResult(item, index, baseDb);
  });
}

exports.processWorkflowResult = processWorkflowResult;
