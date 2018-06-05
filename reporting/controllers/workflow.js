/**
 * This file generates the metadata for a workflow.
 * It also exposes the createWorkflowHeaders module.
 */

/**
 * Module dependencies
 */

const filter = require('lodash').filter;
const flatten = require('lodash').flatten;
const PouchDB = require('pouchdb');

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

exports.all = function(req, res) {
  const GROUP_DB = new PouchDB(req.body.baseDb);
  GROUP_DB.query('ojai/byCollection', { key: 'workflow', include_docs: true })
    .then((data) => res.json({ count: data.rows.length, workflows: data.rows }))
    .catch((err) => res.send(err));
}

/**
 * Generates headers for ALL workflows in the database.
 *
 * Example:
 *
 *    POST /workflow/headers/all
 *
 *  The request object must contain the main database url and a
 *  result database url where the generated headers will be saved.
 *     {
 *       "db_url": "http://admin:password@test.tangerine.org/database_name"
 *       "result_db_url": "http://admin:password@test.tangerine.org/result_database_name"
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

exports.generateAll = async function (req, res) {
  const baseDb = req.body.baseDb;
  const resultDbUrl = req.body.resultDb;
  const GROUP_DB = new PouchDB(baseDb);

  try {
    let workflows = await GROUP_DB.query('ojai/byCollection', { key: 'workflow', include_docs: true });
    for (item of workflows.rows) {
      let workflowId = item.id;
      let generatedWorkflowHeaders = await createWorkflowHeaders(item.doc, baseDb);
      let saveResponse = await dbQuery.saveHeaders(generatedWorkflowHeaders, workflowId, resultDbUrl);
      console.log(saveResponse);
    }
    res.json(workflows);
  } catch (error) {
    console.log(error);
  }
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
 *       "result_db_url": "http://admin:password@test.tangerine.org/result_database_name"
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

exports.generateHeader = function(req, res) {
  const workflowId = req.params.id;
  const baseDb = req.body.baseDb;
  const resultDb = req.body.resultDb;
  const GROUP_DB = new PouchDB(baseDb);

  GROUP_DB.get(workflowId)
    .then(async(doc) => {
      let colHeaders = await createWorkflowHeaders(doc, baseDb);
      const saveResponse = await dbQuery.saveHeaders(colHeaders, workflowId, resultDb);
      console.log(saveResponse);
      res.json(colHeaders);
    })
    .catch((err) => res.send(err));
}


/*****************************
 *     APPLICATION MODULE    *
 *****************************
 */


/**
 * This function creates headers for a workflow.
 *
 * @param {Object} data - worklfow result data.
 * @param {string} baseDb - base database url.
 *
 * @returns {Array} - generated headers for csv.
 */

const createWorkflowHeaders = async function(data, baseDb) {
  let workflowHeaders = [];
  let workflowItems = [];
  let messageCount = 0;
  let count = 0;
  let workflowName = data.name || 'Untitled';

  workflowHeaders.push(workflowName);  // Add workflow name. Needed for csv file name

  for (item of data.children) {
    item.workflowId = data._id;
    let isProcessed = filter(workflowItems, { typesId: item.typesId });
    // this part is needed to avoid processing duplicates.
    let isCurriculumProcessed = item.type === 'curriculum' & !isProcessed.length;

    if (item.type === 'assessment' || isCurriculumProcessed) {
      let assessmentHeaders = await createColumnHeaders(item, count, baseDb);
      workflowHeaders.push(assessmentHeaders);
      count++;
    }

    if (item.type === 'message') {
      let messageSuffix = messageCount > 0 ? `_${messageCount}` : '';
      workflowHeaders.push({ header: `message${messageSuffix}`, key: `${data._id}.message${messageSuffix}` });
      messageCount++;
    }

    workflowItems.push(item);
  }

  workflowHeaders = flatten(workflowHeaders);

  return workflowHeaders;
}

exports.createWorkflowHeaders = createWorkflowHeaders;
