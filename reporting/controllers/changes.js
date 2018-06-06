/**
 * This file implements couch DB changes features.
 * It watches for any changes in the database and
 * processes the changed document based on its collection type.
 */

/**
 * Module Dependencies.
 */

const sortBy = require('lodash').sortBy;
const PouchDB = require('pouchdb');


/**
 * Local dependencies.
 */

const dbQuery = require('./../utils/dbQuery');
const generateAssessmentHeaders = require('./assessment').createColumnHeaders;
const processAssessmentResult = require('./result').generateResult;
const generateWorkflowHeaders = require('./workflow').createWorkflowHeaders;
const processWorkflowResult = require('./trip').processWorkflowResult;
const validateResult = require('./result').validateResult;

/**
 * Processes any recently changed document in the database based on its collection type.
 *
 * Example:
 *
 *    POST /tangerine_changes
 *
 *  The request object must contain the database url and the result database url.
 *       {
 *         "db_url": "http://admin:password@test.tangerine.org/database_name"
 *         "result_db_url": "http://admin:password@test.tangerine.org/result_database_name"
 *       }
 *
 * Response:
 *
 * Returns the changed document in the database.
 *      {
 *        "seq": 1001,
 *        "id": "e1234567890",
 *        "changes": [
 *            {
 *              "rev": "1-123a"
 *            }
 *        ]
 *      }
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */


exports.changes = function(req, res) {
  const baseDb = req.body.baseDb;
  const resultDb = req.body.resultDb;
  const GROUP_DB = new PouchDB(baseDb);

  GROUP_DB.changes({ since: req.body.startPoint, include_docs: true, live: req.body.isLive })
    .on('change', (body) => setTimeout(() => queueProcessChangedDocument({body, baseDb, resultDb}), 200))
    .on('error', (err) => console.error(err));
}


// Event queue for processing changed document
var queue = [];
var isProcessing = false;

const queueProcessChangedDocument = async function(job) {
  queue.push(job);
}

var sleep = (delay) => {
  return new Promise((res) => {
    setTimeout(res, delay);
  })
}

let startQueue = async() => {
  while(true) {
    await sleep(200)
    if (queue.length > 0) {
      let job = queue.shift();
      await processChangedDocument(job.body, job.baseDb, job.resultDb);
    }
  }
}

// initiate event queue
startQueue();


/** @description This function processess document changes
 * in the database based on the collection type i.e. result,
 * assessment, workflow, subtest, question and curriculum.
 *
 * @param {string} resp - assessmentId.
 * @param {string} baseDb - base database url.
 * @param {number} resultDb - result database url.
 *
 * @returns {Object} saved response.
 */

const processChangedDocument = async function(resp, baseDb, resultDb) {
  const assessmentId = resp.doc.assessmentId || resp.doc._id;
  const workflowId = resp.doc.workflowId;
  const collectionType = resp.doc.collection;

  const isWorkflowIdSet = (workflowId) ? true : false;
  const isResult = (collectionType === 'result') ? true : false;
  const isWorkflow = (collectionType === 'workflow') ? true : false;
  const isAssessment = (collectionType === 'assessment') ? true : false;
  const isCurriculum = (collectionType === 'curriculum') ? true : false;
  const isQuestion = (collectionType === 'question') ? true : false;
  const isSubtest = (collectionType === 'subtest') ? true : false;

  console.info(`::: Processing ${resp.doc.collection} document on sequence ${resp.seq} :::`);

  if (isWorkflowIdSet && isResult) {
    console.info('\n<<<=== START PROCESSING WORKFLOW RESULT ===>>>\n');
    try {
      let data = await dbQuery.getTripResults(resp.doc.tripId, baseDb);
      const workflowResult = await processWorkflowResult(data, baseDb);
      const saveResponse = await dbQuery.saveResult(workflowResult, resultDb);
      console.log(saveResponse);
      console.info('\n<<<=== END PROCESSING WORKFLOW RESULT ===>>>\n');
    } catch (error) {
      console.error(error);
    }
  }

  if (!isWorkflowIdSet && isResult) {
    try {
      console.info('\n<<<=== START PROCESSING ASSESSMENT RESULT  ===>>>\n');
      let assessmentResult = await processAssessmentResult([resp], 0, baseDb);
      let docId = assessmentResult.indexKeys.collectionId;
      let groupTimeZone = assessmentResult.indexKeys.groupTimeZone;
      let allTimestamps = sortBy(assessmentResult.indexKeys.timestamps);

      // Validate result from all subtest timestamps
      let validationData = await validateResult(docId, groupTimeZone, baseDb, allTimestamps);
      assessmentResult.isValid = validationData.isValid;
      assessmentResult.isValidReason = validationData.reason;
      assessmentResult[`${docId}.start_time`] = validationData[`${docId}.start_time`];
      assessmentResult[`${docId}.end_time`] = validationData[`${docId}.end_time`];

      assessmentResult.indexKeys.ref = assessmentResult.indexKeys.ref;
      assessmentResult.indexKeys.parent_id = docId;
      assessmentResult.indexKeys.year = validationData.indexKeys.year;
      assessmentResult.indexKeys.month = validationData.indexKeys.month;
      assessmentResult.indexKeys.day = validationData.indexKeys.day;

      const saveResponse = await dbQuery.saveResult(assessmentResult, resultDb);
      console.log(saveResponse);
      console.info('\n<<<=== END PROCESSING ASSESSMENT RESULT ===>>>\n');
    } catch (err) {
      console.error(err);
    }
  }

  if (isWorkflow) {
    try {
      console.info('\n<<<=== START PROCESSING WORKFLOW COLLECTION  ===>>>\n');
      const docId = workflowId || resp.doc._id;
      const workflowHeaders = await generateWorkflowHeaders(resp.doc, baseDb);
      const saveResponse = await dbQuery.saveHeaders(workflowHeaders, docId, resultDb);
      console.log(saveResponse);
      console.info('\n<<<=== END PROCESSING WORKFLOW COLLECTION ===>>>\n');
    } catch (err) {
      console.error(err);
    }
  }

  if (isAssessment || isCurriculum || isQuestion || isSubtest) {
    try {
      console.info('\n<<<=== START PROCESSING ASSESSMENT or CURRICULUM or SUBTEST or QUESTION COLLECTION  ===>>>\n');
      const GROUP_DB = new PouchDB(baseDb);
      let assessmentDoc = await GROUP_DB.get(assessmentId);
      let assessmentHeaders = await generateAssessmentHeaders(resp.doc, 0, baseDb);
      assessmentHeaders.unshift(assessmentDoc.name); // Add assessment name. Needed for csv file name.
      const saveResponse = await dbQuery.saveHeaders(assessmentHeaders, assessmentId, resultDb);
      console.log(saveResponse);
      console.info('\n<<<=== END PROCESSING ASSESSMENT or CURRICULUM or SUBTEST or QUESTION COLLECTION ===>>>\n');
    } catch (err) {
      console.error(err);
    }
  }

}

exports.processChangedDocument = processChangedDocument;
