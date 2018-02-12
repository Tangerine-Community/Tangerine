/**
 * This file generates the metadata for a workflow.
 * It also exposes the createWorkflowHeaders module.
 */

/**
 * Module dependencies
 */

const _ = require('lodash');
const nano = require('nano');

/**
 * Local modules
 */

const createColumnHeaders = require('./assessment').createColumnHeaders;
const dbQuery = require('./../utils/dbQuery');

/**
 * Retrieves all workflow collections in the database.
 *
 * Example:
 *
 *    POST /workflow
 *
 *  The request object must contain the database url
 *       {
 *         "db_url": "http://admin:password@test.tangerine.org/database_name"
 *       }
 *
 * Response:
 *
 *  Returns an Array of objects of workflow collections.
 *    [
 *    	{
 *        "id": "a1234567890",
 *        "key": "assessment",
 *        "value": {
 *        	"r": "1-b123"
 *        },
 *        "doc": {
 *        	"_id": "a1234567890",
 *        	"_rev": "1-b123",
 *        	"name": "After Testing",
 *        	"assessmentId": "a1234567890",
 *        	"collection": "workflow"
 *        }
 *      },
 *      ...
 *    ]
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.all = (req, res) => {
  dbQuery.getAllWorkflow(req.body.base_db)
    .then((data) => res.json({ count: data.length, workflows: data }))
    .catch((err) => res.json(Error(err)));
}

/**
 * Generates headers for a workflow.
 *
 * Example:
 *
 *    POST /workflow/headers/:id
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

exports.generateHeader = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;
  const workflowId = req.params.id;

  dbQuery.retrieveDoc(workflowId, dbUrl)
    .then(async(doc) => {
      let colHeaders = await createWorkflowHeaders(doc, dbUrl);
      const saveResponse = await dbQuery.saveHeaders(colHeaders, workflowId, resultDbUrl);
      res.json(saveResponse);
    })
    .catch((err) => res.send(Error(err)));
}

/**
 * Generates headers for ALL workflows in the database.
 *
 * Example:
 *
 *    POST /workflow/headers/_all
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

exports.generateAll = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;

  dbQuery.getAllWorkflow(dbUrl)
    .then(async(data) => {
      let saveResponse;
      for (item of data) {
        let workflowId = item.id;
        let generatedWorkflowHeaders = await createWorkflowHeaders(item.doc, dbUrl);
        saveResponse = await dbQuery.saveHeaders(generatedWorkflowHeaders, workflowId, resultDbUrl);
        console.log(saveResponse);
      }
      res.json(saveResponse);
    })
    .catch((err) => res.send(Error(err)));
}


/*****************************
 *     APPLICATION MODULE    *
 *****************************
 */


/**
 * This function creates headers for a workflow.
 *
 * @param {string} docId - worklfow id of the document.
 * @param {string} dbUrl - databse url.
 *
 * @returns {Array} - generated headers for csv.
 */

const createWorkflowHeaders = async function(data, dbUrl) {
  let workflowHeaders = [];
  let workflowItems = [];
  let messageCount = 0;
  let count = 0;

  for (item of data.children) {
    let isProcessed = _.filter(workflowItems, {typesId: item.typesId});
    item.workflowId = data._id;

    if (item.type === 'assessment') {
      let assessmentHeaders = await createColumnHeaders(item, count, dbUrl);
      workflowHeaders.push(assessmentHeaders);
      count++;
    }
    if (item.type === 'curriculum' & !isProcessed.length) {
      let curriculumHeaders = await createColumnHeaders(item, count, dbUrl);
      workflowHeaders.push(curriculumHeaders);
      count++;
    }
    if (item.type === 'message') {
      let messageSuffix = messageCount > 0 ? `_${messageCount}` : '';
      workflowHeaders.push({ header: `message${messageSuffix}`, key: `${data._id}.message${messageSuffix}` });
      messageCount++;
    }
    workflowItems.push(item);
  }
  workflowHeaders = _.flatten(workflowHeaders);

  return workflowHeaders;
}

exports.createWorkflowHeaders = createWorkflowHeaders;
