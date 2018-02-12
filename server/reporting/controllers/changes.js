/**
 * This file implements couch DB changes features.
 * It watches for any changes in the database and
 * processes the changed document based on its collection type.
 */

/**
 * Module Dependencies.
 */

const _ = require('lodash');
const Excel = require('exceljs');
const nano = require('nano');

/**
 * Local Depencies.
 */

const dbConfig = require('./../config');
const dbQuery = require('./../utils/dbQuery');
const generateAssessmentHeaders = require('./assessment').createColumnHeaders;
const processAssessmentResult = require('./result').generateResult;
const generateWorkflowHeaders = require('./workflow').createWorkflowHeaders;
const processWorkflowResult = require('./trip').processWorkflowResult;

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
 *         "another_db_url": "http://admin:password@test.tangerine.org/result_database_name"
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

exports.changes = async(req, res) => {
  const dbUrl = req.body.base_db || dbConfig.base_db;
  const resultDbUrl = req.body.result_db || dbConfig.result_db;

  // TODO: Uncomment all commented code to start processing from last update sequence
  // let seq = await dbQuery.checkUpdateSequence(resultDbUrl);

  const BASE_DB = nano(dbUrl);
  const feed = BASE_DB.follow({ since: 'now', include_docs: true });

  feed.on('change', async(resp) => {
    feed.pause();
    processChangedDocument(resp, dbUrl, resultDbUrl);
    setTimeout(function() { feed.resume() }, 500);
  });

  feed.on('error', (err) => res.send(Error(err)));
  feed.follow();
}

const processChangedDocument = async(resp, dbUrl, resultDbUrl) => {
  const assessmentId = resp.doc.assessmentId;
  const workflowId = resp.doc.workflowId;
  const collectionType = resp.doc.collection;

  const isWorkflowIdSet = (workflowId) ? true : false;
  const isResult = (collectionType === 'result') ? true : false;
  const isWorkflow = (collectionType === 'workflow') ? true : false;
  const isAssessment = (collectionType === 'assessment') ? true : false;
  const isCurriculum = (collectionType === 'curriculum') ? true : false;
  const isQuestion = (collectionType === 'question') ? true : false;
  const isSubtest = (collectionType === 'subtest') ? true : false;
  // let seqDoc = { key: 'last_update_sequence' };

  if (isWorkflowIdSet && isResult) {
    // seqDoc = { last_seq: resp.seq };
    console.info('\n<<<=== START PROCESSING WORKFLOW RESULT ===>>>\n');
    dbQuery.getResults(resp.doc.tripId, dbUrl)
      .then(async(data) => {
        let totalResult = {};
        const workflowResult = await processWorkflowResult(data, dbUrl);
        workflowResult.forEach(element => totalResult = Object.assign(totalResult, element));
        const saveResponse = await dbQuery.saveResult(totalResult, resultDbUrl);
        console.log(saveResponse);
        // await dbQuery.saveUpdateSequence(resultDbUrl, seqDoc);
        console.info('\n<<<=== END PROCESSING WORKFLOW RESULT ===>>>\n');
      })
      .catch((err) => console.error(err));
  }

  if (!isWorkflowIdSet && isResult) {
    // seqDoc = { last_seq: resp.seq };
    console.info('\n<<<=== START PROCESSING ASSESSMENT RESULT  ===>>>\n');
    const assessmentResult = await processAssessmentResult([resp], 0, dbUrl);
    const saveResponse = await dbQuery.saveResult(assessmentResult, resultDbUrl);
    console.log(saveResponse);
    // await dbQuery.saveUpdateSequence(resultDbUrl, seqDoc);
    console.info('\n<<<=== END PROCESSING ASSESSMENT RESULT ===>>>\n');
  }

  if (isWorkflow) {
    // seqDoc = { last_seq: resp.seq };
    console.info('\n<<<=== START PROCESSING WORKFLOW COLLECTION  ===>>>\n');
    const workflowHeaders = await generateWorkflowHeaders(resp.doc, dbUrl);
    const saveResponse = await dbQuery.saveHeaders(workflowHeaders, workflowId, resultDbUrl);
    console.log(saveResponse);
    // await dbQuery.saveUpdateSequence(resultDbUrl, seqDoc);
    console.info('\n<<<=== END PROCESSING WORKFLOW COLLECTION ===>>>\n');
  }

  if (isAssessment || isCurriculum || isQuestion || isSubtest) {
    // seqDoc = { last_seq: resp.seq };
    console.info('\n<<<=== START PROCESSING ASSESSMENT or CURRICULUM or SUBTEST or QUESTION COLLECTION  ===>>>\n');
    const assessmentHeaders = await generateAssessmentHeaders(assessmentId, 0, dbUrl);
    const saveResponse = await dbQuery.saveHeaders(assessmentHeaders, assessmentId, resultDbUrl);
    console.log(saveResponse);
    // await dbQuery.saveUpdateSequence(resultDbUrl, seqDoc);
    console.info('\n<<<=== END PROCESSING ASSESSMENT or CURRICULUM or SUBTEST or QUESTION COLLECTION ===>>>\n');
  }

}

exports.processChangedDocument = processChangedDocument;
