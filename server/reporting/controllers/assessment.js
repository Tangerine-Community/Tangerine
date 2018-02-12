/**
 * This file creates headers or metadata from an assessment.
 * These headers or metadata will serve as column headers for CSV generation.
 *
 * Module: createColumnHeaders.
 */

/**
 * Module dependencies.
 */

const _ = require('lodash');
const Excel = require('exceljs');
const nano = require('nano');

/**
 * Local dependency.
 */

const dbQuery = require('./../utils/dbQuery');

/**
 * Retrieves all assessment collection in the database.
 *
 * Example:
 *
 *    POST /assessment
 *
 *  The request object must contain the database url
 *       {
 *         "db_url": "http://admin:password@test.tangerine.org/database_name"
 *       }
 *
 * Response:
 *
 *  Returns an Array of objects of assessment collections.
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
 *        	"collection": "assessment"
 *        }
 *      },
 *      ...
 *    ]
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.all = (req, res) => {
  dbQuery.getAllAssessment(req.body.base_db)
    .then((data) => res.json({ count: data.length, assessments: data }))
    .catch((err) => res.send(Error(err)));
}

/**
 * Generates headers for an assessment and saves it in the database.
 *
 * Example:
 *
 *    POST /assessment/headers/:id
 *
 *  where id refers to the assessment id of the document
 *
 *  The request object must contain the main database url and a
 *  result database url where the generated header will be saved.
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
 *      }
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.generateHeader = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;
  const assessmentId = req.params.id;

  dbQuery.retrieveDoc(assessmentId, dbUrl)
    .then(async(data) => {
      const docId = data.assessmentId || data.curriculumId;
      const colHeaders = await createColumnHeaders(data, 0, dbUrl);
      const saveResponse = await dbQuery.saveHeaders(colHeaders, docId, resultDbUrl);
      res.json(saveResponse);
    })
    .catch((err) => res.send(Error(err)));
}

/**
 * Generates headers for ALL assessment collections in a database
 * and save them in a different database.
 *
 * Example:
 *
 *    POST /assessment/headers/_all
 *
 *  The request object must contain the main database url and a
 *  result database url where the generated header will be saved.
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
 *      }
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
exports.generateAll = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;

  dbQuery.getAllAssessment(dbUrl)
    .then(async(data) => {
      let saveResponse;

      for (item of data) {
        let assessmentId = item.doc.assessmentId;
        let generatedHeaders = await createColumnHeaders(item.doc, 0, dbUrl);
        saveResponse = await dbQuery.saveHeaders(generatedHeaders, assessmentId, resultDbUrl);
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
 * This function processes the headers for an assessment.
 *
 * @param {string} docId - assessmentId.
 * @param {number} count - count.
 * @param {string} dbUrl - database url.
 *
 * @returns {Object} processed headers for csv.
 */

const createColumnHeaders = function(doc, count = 0, dbUrl) {
  let assessments = [];
  let docId = doc.workflowId || doc.assessmentId || doc.curriculumId;
  let collectionId = doc.typesId || doc.assessmentId || doc.curriculumId;

  return new Promise((resolve, reject) => {
    dbQuery.retrieveDoc(collectionId, dbUrl)
      .then((item) => {
        let assessmentSuffix = count > 0 ? `_${count}` : '';
        assessments.push({ header: `assessment_id${assessmentSuffix}`, key: `${docId}.assessmentId${assessmentSuffix}` });
        assessments.push({ header: `assessment_name${assessmentSuffix}`, key: `${docId}.assessmentName${assessmentSuffix}` });
        assessments.push({ header: `enumerator${assessmentSuffix}`, key: `${docId}.enumerator${assessmentSuffix}` });
        assessments.push({ header: `start_time${assessmentSuffix}`, key: `${docId}.start_time${assessmentSuffix}` });
        assessments.push({ header: `order_map${assessmentSuffix}`, key: `${docId}.order_map${assessmentSuffix}` });
        return dbQuery.getSubtests(collectionId, dbUrl);
      })
      .then(async(subtestData) => {
        let subtestCounts = {
          locationCount: 0,
          datetimeCount: 0,
          idCount: 0,
          consentCount: 0,
          gpsCount: 0,
          cameraCount: 0,
          surveyCount: 0,
          gridCount: 0,
          timestampCount: 0
        };

        for (data of subtestData) {
          if (data.prototype === 'location') {
            let location = createLocation(data, subtestCounts);
            assessments = assessments.concat(location);
            subtestCounts.locationCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'datetime') {
            let datetime = createDatetime(data, subtestCounts);
            assessments = assessments.concat(datetime);
            subtestCounts.datetimeCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'consent') {
            let consent = createConsent(data, subtestCounts);
            assessments = assessments.concat(consent);
            subtestCounts.consentCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'id') {
            let id = createId(data, subtestCounts);
            assessments = assessments.concat(id);
            subtestCounts.idCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'survey') {
            let surveys = await createSurvey(data._id, subtestCounts, dbUrl);
            assessments = assessments.concat(surveys);
            subtestCounts.surveyCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'grid') {
            let grid = await createGrid(data, subtestCounts, dbUrl);
            assessments = assessments.concat(grid.gridHeader);
            subtestCounts.gridCount++;
            subtestCounts.timestampCount = grid.timestampCount;
          }
          if (data.prototype === 'gps') {
            let gps = createGps(data, subtestCounts);
            assessments = assessments.concat(gps);
            subtestCounts.gpsCount++;
            subtestCounts.timestampCount++;
          }
          if (data.prototype === 'camera') {
            let camera = createCamera(data, subtestCounts);
            assessments = assessments.concat(camera);
            subtestCounts.cameraCount++;
            subtestCounts.timestampCount++;
          }
        }
        let assessmentSuffix = count > 0 ? `_${count}` : '';
        assessments.push({ header: `end_time${assessmentSuffix}`, key: `${docId}.end_time${assessmentSuffix}` });

        resolve(assessments);
      })
      .catch((err) => reject(err));
  });

}

/***********************************************
 *  HELPER FUNCTIONS FOR CREATING HEADERS     *
 *        FOR DIFFERENT PROTOTYPES            *
 **********************************************
*/

/**
 * This function creates headers for location prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated location headers.
 */

function createLocation(doc, subtestCounts) {
  let count = subtestCounts.locationCount;
  let locationHeader = [];
  let labels = doc.levels;

  for (i = 0; i < labels.length; i++) {
    let locSuffix = count > 0 ? `_${count}` : '';
    locationHeader.push({
      header: `${labels[i]}${locSuffix}`,
      key: `${doc._id}.${labels[i].toLowerCase()}${locSuffix}`
    });
  }
  locationHeader.push({
    header: `timestamp_${subtestCounts.timestampCount}`,
    key: `${doc._id}.timestamp_${subtestCounts.timestampCount}`
  });

  return locationHeader;
}

/**
 * This function creates headers for datetime prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated datetime headers.
 */

function createDatetime(doc, subtestCounts) {
  let count = subtestCounts.datetimeCount;
  let suffix, datetimeHeader = [];
  suffix = count > 0 ? `_${count}` : '';

  datetimeHeader.push({ header: `year${suffix}`, key: `${doc._id}.year${suffix}` });
  datetimeHeader.push({ header: `month${suffix}`, key: `${doc._id}.month${suffix}` });
  datetimeHeader.push({ header: `day${suffix}`, key: `${doc._id}.day${suffix}` });
  datetimeHeader.push({ header: `assess_time${suffix}`, key: `${doc._id}.assess_time${suffix}` });
  datetimeHeader.push({ header: `timestamp_${subtestCounts.timestampCount}`, key: `${doc._id}.timestamp_${subtestCounts.timestampCount}` });

  return datetimeHeader;
}

/**
 * This function creates headers for consent prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated consent headers.
 */

function createConsent(doc, subtestCounts) {
  let count = subtestCounts.consentCount;
  let suffix, consentHeader = [];

  suffix = count > 0 ? `_${count}` : '';
  consentHeader.push({ header: `consent${suffix}`, key: `${doc._id}.consent${suffix}` });
  consentHeader.push({ header: `timestamp_${subtestCounts.timestampCount}`, key: `${doc._id}.timestamp_${subtestCounts.timestampCount}` });

  return consentHeader;
}

/**
 * This function creates headers for id prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated id headers.
 */

function createId(doc, subtestCounts) {
  let count = subtestCounts.idCount;
  let suffix, idHeader = [];

  suffix = count > 0 ? `_${count}` : '';
  idHeader.push({ header: `id${suffix}`, key: `${doc._id}.id${suffix}` });
  idHeader.push({ header: `timestamp_${subtestCounts.timestampCount}`, key: `${doc._id}.timestamp_${subtestCounts.timestampCount}` });

  return idHeader;
}

/**
 * This function creates headers for survey prototypes.
 *
 * @param {Object} id - document to be processed.
 * @param {Object} subtestCounts - count.
 * @param {string} dbUrl - database url.
 *
 * @returns {Array} - generated survey headers.
 */

async function createSurvey(id, subtestCounts, dbUrl) {
  let surveyHeader = [];
  let questions = await dbQuery.getQuestionBySubtestId(id, dbUrl);
  let sortedDoc = _.sortBy(questions, [id, 'order']);

  for (doc of sortedDoc) {
    surveyHeader.push({
      header: `${doc.name}`,
      key: `${doc.subtestId}.${doc.name}`
    });
  }
  surveyHeader.push({
    header: `timestamp_${subtestCounts.timestampCount}`,
    key: `${id}.timestamp_${subtestCounts.timestampCount}`
  });

  return surveyHeader;
}

/**
 * This function creates headers for grid prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated grid headers.
 */

async function createGrid(doc, subtestCounts, dbUrl) {
  let count = subtestCounts.gridCount;
  let gridHeader = [];
  let gridData = [doc];
  let suffix = count > 0 ? `_${count}` : '';

  for (sub of gridData) {
    let subtestId = sub._id;
    let variableName = sub.variableName;
    variableName = variableName ? variableName : sub.name && sub.name.toLowerCase().replace(/\s/g, '_');

    // if no variable name break out of loop
    if (!variableName) {
      break;
    }

    gridHeader.push({
      header: `${variableName}_auto_stop${suffix}`,
      key: `${subtestId}.${variableName}_auto_stop${suffix}`
    });
    gridHeader.push({
      header: `${variableName}_time_remain${suffix}`,
      key: `${subtestId}.${variableName}_time_remain${suffix}`
    });
    gridHeader.push({
      header: `${variableName}_capture_item_at_time${suffix}`,
      key: `${subtestId}.${variableName}_capture_item_at_time${suffix}`
    });
    gridHeader.push({
      header: `${variableName}_attempted${suffix}`,
      key: `${subtestId}.${variableName}_attempted${suffix}`
    });
    gridHeader.push({
      header: `${variableName}_time_intermediate_captured${suffix}`,
      key: `${subtestId}.${variableName}_time_intermediate_captured${suffix}`
    });
    gridHeader.push({
      header: `${variableName}_time_allowed${suffix}`,
      key: `${subtestId}.${variableName}_time_allowed${suffix}`
    });

    let i; let items = sub.items;

    for (i = 0; i < items.length; i++) {
      let label = items[i];
      gridHeader.push({
        header: `${variableName}_${label}${suffix}`,
        key: `${subtestId}.${variableName}_${label}${suffix}`
      });
    }
    gridHeader.push({
      header: `timestamp_${subtestCounts.timestampCount}`,
      key: `${subtestId}.timestamp_${subtestCounts.timestampCount}`
    });
    subtestCounts.timestampCount++;
  }

  return { gridHeader, timestampCount: subtestCounts.timestampCount };
}

/**
 * This function creates headers for gps prototypes.
 *
 * @param {Object} doc - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated gps headers.
 */

function createGps(doc, subtestCounts) {
  let count = subtestCounts.gpsCount;
  let gpsHeader = [];
  let suffix = count > 0 ? `_${count}` : '';

  gpsHeader.push({ header: `latitude${suffix}`, key: `${doc._id}.latitude${suffix}` });
  gpsHeader.push({ header: `longitude${suffix}`, key: `${doc._id}.longitude${suffix}` });
  gpsHeader.push({ header: `accuracy${suffix}`, key: `${doc._id}.accuracy${suffix}` });
  gpsHeader.push({ header: `altitude${suffix}`, key: `${doc._id}.altitude${suffix}` });
  gpsHeader.push({ header: `altitudeAccuracy${suffix}`, key: `${doc._id}.altitudeAccuracy${suffix}` });
  gpsHeader.push({ header: `heading${suffix}`, key: `${doc._id}.heading${suffix}` });
  gpsHeader.push({ header: `speed${suffix}`, key: `${doc._id}.speed${suffix}` });
  gpsHeader.push({ header: `timestamp_${subtestCounts.timestampCount}`, key: `${doc._id}.timestamp_${subtestCounts.timestampCount}` });

  return gpsHeader;
}

/**
 * This function creates headers for camera prototypes.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Array} - generated camera headers.
 */

function createCamera(doc, subtestCounts) {
  let count = subtestCounts.cameraCount;
  let cameraheader = [];
  let varName = doc.variableName;
  let suffix = count > 0 ? `_${count}` : '';

  cameraheader.push({ header: `${varName}_photo_captured${suffix}`, key: `${doc.subtestId}.${varName}_photo_captured${suffix}` });
  cameraheader.push({ header: `${varName}_photo_url${suffix}`, key: `${doc.subtestId}.${varName}_photo_url${suffix}` });
  cameraheader.push({ header: `timestamp_${subtestCounts.timestampCount}`, key: `${doc.subtestId}.timestamp_${subtestCounts.timestampCount}` });

  return cameraheader;
}

exports.createColumnHeaders = createColumnHeaders;
