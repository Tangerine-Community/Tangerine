/**
 * This file processes the result of an assessment.
 * The processed result will serve as the values for CSV generation.
 *
 * Module: generateResult.
 */

/**
 * Module dependencies.
 */

const _ = require('lodash');
const nano = require('nano');
const moment = require('moment');
moment().format();

/**
 * Local dependencies.
 */

const dbQuery = require('./../utils/dbQuery');

/**
 * Define value maps for grid and survey values.
 */

const gridValueMap = {
  'correct': '1',
  'incorrect': '0',
  'missing': '.',
  'skipped': '999',
  'logicSkipped': '999'
};

const surveyValueMap = {
  'checked': '1',
  'unchecked': '0',
  'not asked': '.',
  'skipped': '999',
  'logicSkipped': '999'
};

/**
 * Retrieves all result collection in the database.
 *
 * Example:
 *
 *    POST /result
 *
 *  The request object must contain the database url
 *       {
 *         "db_url": "http://admin:password@test.tangerine.org/database_name"
 *       }
 *
 * Response:
 *
 *  Returns an Array of objects of result collections.
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
 *          "assessmentName": "Test Result"
 *          "subtestData": [
 *            {
 *              "name": "I am a location data"
 *              "data": {}
 *           },
 *            {
 *              "name": "just a datetime subtest prototype"
 *              "data": {}
 *            }
 *          ]
 *        	"collection": "result"
 *        }
 *      },
 *      ...
 *    ]
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.all = (req, res) => {
  dbQuery.getAllResult(req.body.base_db)
    .then((data) => res.json(data))
    .catch((err) => res.json(Error(err)));
}

/**
 * Processes result for an assessment and saves it in the database.
 *
 * Example:
 *
 *    POST /assessment/result/:id
 *
 *  where id refers to the id of the result document.
 *
 *  The request object must contain the main database url and a
 *  result database url where the processed result will be saved.
 *
 * Request:
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

exports.processResult = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;
  const docId = req.params.id;

  dbQuery.retrieveDoc(docId, dbUrl)
    .then(async(data) => {
      let resultDoc = { doc: data };
      const result = await generateResult(resultDoc, 0, dbUrl);
      const saveResponse = await dbQuery.saveResult(result, resultDbUrl);
      console.log(saveResponse);
      res.json(result);
    })
    .catch((err) => res.send(Error(err)));
}

/**
 * Process results for ALL assessments in a database
 * and save them in a different database.
 *
 * Example:
 *
 *    POST /assessment/result/_all
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

exports.processAll = (req, res) => {
  const dbUrl = req.body.base_db;
  const resultDbUrl = req.body.result_db;

  dbQuery.getAllResult(dbUrl)
    .then(async(data) => {
      let saveResponse;
      for (item of data) {
        let docId = item.assessmentId || item.curriculumId;
        let ref = item._id;
        let processedResult = await generateResult(docId, 0, dbUrl);
        saveResponse = await dbQuery.saveResult(processedResult, ref, resultDbUrl);
      }
      res.json(saveResponse);
    })
    .catch((err) => res.send(Error(err)))
}


/************************
 *  APPLICATION MODULE  *
 ************************
 */


/**
 * This function processes the result for an assessment.
 *
 * @param {string} docId - assessment id.
 * @param {number} count - count
 * @param {string} dbUrl - database url.
 *
 * @returns {Object} - processed result for csv.
 */

const generateResult = async function(collections, count = 0, dbUrl) {
  let enumeratorName, collection, collectionId, allTimestamps = [];
  let result = {};
  let indexKeys = {};
  let assessmentSuffix = count > 0 ? `_${count}` : '';
  let resultCollections = _.isArray(collections) ? collections : [collections];
  let dbSettings = await dbQuery.getSettings(dbUrl);
  let groupTimeZone = dbSettings.timeZone;

  for (let [index, data] of resultCollections.entries()) {
    collection = data.doc;
    collectionId = collection.workflowId || collection.assessmentId || collection.curriculumId;
    enumeratorName = collection.enumerator || collection.editedBy;

    result[`${collectionId}.assessmentId${assessmentSuffix}`] = collectionId;
    result[`${collectionId}.assessmentName${assessmentSuffix}`] = collection.assessmentName;
    result[`${collectionId}.enumerator${assessmentSuffix}`] = enumeratorName.replace(/\s/g,'-');
    result[`${collectionId}.order_map${assessmentSuffix}`] = collection.order_map ? collection.order_map.join(',') : '';

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
    let subtestData = _.isArray(collection.subtestData) ? collection.subtestData : [collection.subtestData];

    if (subtestData[0] !== undefined) {
      for (doc of subtestData) {
        allTimestamps.push(doc.timestamp);
        if (doc.prototype === 'location') {
          doc.enumerator = enumeratorName;
          let location = await processLocationResult(doc, subtestCounts, groupTimeZone, dbUrl);
          result = _.assignIn(result, location);
          subtestCounts.locationCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'datetime') {
          let datetime = processDatetimeResult(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, datetime);
          subtestCounts.datetimeCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'consent') {
          let consent = processConsentResult(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, consent);
          subtestCounts.consentCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'id') {
          let id = processIDResult(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, id);
          subtestCounts.idCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'survey') {
          let survey = processSurveyResult(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, survey);
          subtestCounts.surveyCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'grid') {
          let grid = processGridResult(doc, subtestCounts, groupTimeZone, assessmentSuffix);
          result = _.assignIn(result, grid);
          subtestCounts.gridCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'gps') {
          let gps = processGpsResult(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, gps);
          subtestCounts.gpsCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'camera') {
          let camera = processCamera(doc, subtestCounts, groupTimeZone);
          result = _.assignIn(result, camera);
          subtestCounts.cameraCount++;
          subtestCounts.timestampCount++;
        }
        if (doc.prototype === 'complete') {
          let endTimestamp = convertToTimeZone(doc.data.end_time, groupTimeZone);
          result[`${collectionId}.end_time${assessmentSuffix}`] = moment(endTimestamp).format('hh:mm');
        }
      }
    }
  }
  // Validate result from subtest timestamps
  allTimestamps = _.sortBy(allTimestamps);
  let validationData = await validateResult(collection, groupTimeZone, dbUrl, allTimestamps);
  result.isValid = validationData.isValid;
  result.isValidReason = validationData.reason;

  result.start_time = moment(validationData.startTime).format('hh:mm');
  result.end_time = moment(validationData.endTime).format('hh:mm');

  indexKeys.parent_id = collectionId;
  indexKeys.ref = collection.workflowId ? collection.tripId : collection._id;
  indexKeys.year = moment(validationData.startTime).year();
  indexKeys.month = moment(validationData.startTime).format('MMM');
  indexKeys.day = moment(validationData.startTime).date();
  indexKeys.time = moment(validationData.startTime).format('hh:mm');
  result.indexKeys = indexKeys;

  // Include user metadata
  let username = `user-${enumeratorName}`;
  let userDetails = await dbQuery.getUserDetails(username, dbUrl);
  result.userRole = userDetails.role;
  result.mPesaNumber = userDetails.mPesaNumber;
  result.phoneNumber = userDetails.phoneNumber || userDetails.phone;
  result.fullName = `${userDetails.firstName || userDetails.first} ${userDetails.lastName || userDetails.last}`;

  return result;
}

/**********************************************
 *  HELPER FUNCTIONS FOR PROCESSING RESULTS   *
 *          FOR DIFFERENT PROTOTYPES          *
 **********************************************
 */

/**
 * This function processes result for a location prototype.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed location data.
 */

async function processLocationResult(body, subtestCounts, groupTimeZone, dbUrl) {
  let count = subtestCounts.locationCount;
  let i, locationResult = {};
  let locSuffix = count > 0 ? `_${count}` : '';
  let subtestId = body.subtestId;
  let locationNames = await getLocationName(body, dbUrl);
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  locationResult[`${subtestId}.county${locSuffix}`] = locationNames.county.label.replace(/\s/g,'-');
  locationResult[`${subtestId}.subcounty${locSuffix}`] = locationNames.subcounty.label.replace(/\s/g,'-');
  locationResult[`${subtestId}.zone${locSuffix}`] = locationNames.zone.label.replace(/\s/g,'-');
  locationResult[`${subtestId}.school${locSuffix}`] = locationNames.school.label.replace(/\s/g,'-');
  locationResult[`${subtestId}.timestamp_${subtestCounts.timestampCount}`] = moment(timestamp).format('hh:mm');

  return locationResult;
}

/**
 * @description – This function retrieves the county,
 * subcounty, zone and school data from the location list.
 *
 * @param {object} body - subtest location details.
 * @param {string} dbUrl - database base url.
 *
 * @returns {object} - An object containing the county,
 *  subcounty, zone & school data.
 */

async function getLocationName(body, dbUrl) {
  let i, j, locNames = {}, locIds = [];
  let schoolId = body.data.schoolId;

  // retrieve location-list from the base database.
  let locationList = await dbQuery.getLocationList(dbUrl);
  let levels = locationList.locationsLevels;

  if (schoolId) {
    let username = `user-${body.enumerator}`;
    let userDetails = await dbQuery.getUserDetails(username, dbUrl);

    for (const [label, id] of Object.entries(userDetails.location)) {
      for (j = 0; j < levels.length; j++) {
        if (label == levels[j]) {
          locIds.push(id);
          break;
        }
      }
    }
    if (locIds.length < levels.length) {
      locIds.push(schoolId);
    }
  } else {
    locIds = body.data.location;
  }

  for (i = 0; i < levels.length; i++) {
    locNames[levels[i]] = _.get(locationList.locations, locIds[i]);

    if (locNames[levels[i]]) {
      locNames[levels[i+1]] = _.get(locNames[levels[i]].children, locIds[i+1]);

      if (!locNames[levels[i+1]]) {
        for (const [key, val] of Object.entries(locNames[levels[i]].children)) {
          locNames[levels[i+2]] =  _.get(val.children, locIds[i+1]);

          if (locNames[levels[i+2]]) {
            locNames[levels[i+1]] = val;
            locNames[levels[i+3]] = _.get(locNames[levels[i+2]].children, locIds[i+2]);
            break;
          } else {

            for (const [prop, value] of Object.entries(locNames[levels[i]].children)) {
              locNames[levels[i+3]] = _.get(value.children, locIds[i+1]);

              if (locNames[levels[i+3]]) {
                locNames[levels[i+2]] = value;
                locNames[levels[i+1]] = val;
                break;
              }
            }
          }
        }
      } else {
        locNames[locLabels[i+2]] = _.get(locNames[locLabels[i+1]].children, locIds[i+2]);
        if (locNames[locLabels[i+2]]) {
          locNames[locLabels[i+3]] = _.get(locNames[locLabels[i+2]].children, locIds[i+3]);
        }
      }
      break;
    }
  }

  return locNames;
}

/**
 * This function processes result for a datetime prototype.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed datetime data.
 */

function processDatetimeResult(body, subtestCounts, groupTimeZone) {
  let suffix = subtestCounts.datetimeCount > 0 ? `_${subtestCounts.datetimeCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  datetimeResult = {
    [`${body.subtestId}.year${suffix}`]: body.data.year,
    [`${body.subtestId}.month${suffix}`]: body.data.month,
    [`${body.subtestId}.day${suffix}`]: body.data.day,
    [`${body.subtestId}.assess_time${suffix}`]: body.data.time,
    [`${body.subtestId}.timestamp_${subtestCounts.timestampCount}`]: moment(timestamp).format('hh:mm')
  }
  return datetimeResult;
}

/**
 * This function processes a consent prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed consent data.
 */

function processConsentResult(body, subtestCounts, groupTimeZone) {
  let suffix = subtestCounts.consentCount > 0 ? `_${subtestCounts.consentCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  consentResult = {
    [`${body.subtestId}.consent${suffix}`]: body.data.consent,
    [`${body.subtestId}.timestamp_${subtestCounts.timestampCount}`]: moment(timestamp).format('hh:mm')
  };
  return consentResult;
}

/**
 * This function processes an id prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed id data.
 */

function processIDResult(body, subtestCounts, groupTimeZone) {
  let suffix = subtestCounts.idCount > 0 ? `_${subtestCounts.idCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  idResult = {
    [`${body.subtestId}.id${suffix}`]: body.data.participant_id,
    [`${body.subtestId}.timestamp_${subtestCounts.timestampCount}`]: moment(timestamp).format('hh:mm')
  };
  return idResult;
}

/**
 * This function processes a survey prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed survey data.
 */

function processSurveyResult(body, subtestCounts, groupTimeZone) {
  let count = subtestCounts.surveyCount;
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);
  let surveyResult = {};
  let response = [];

  for (doc in body.data) {
    if (typeof body.data[doc] === 'object') {
      for (item in body.data[doc]) {
        let surveyValue = translateSurveyValue(body.data[doc][item]);
        response.push(surveyValue);
        surveyResult[`${body.subtestId}.${doc}`] = response.join(',');
      }
    } else {
      let value = translateSurveyValue(body.data[doc]);
      surveyResult[`${body.subtestId}.${doc}`] = value;
    }
  }
  // TODO: Uncomment when we confirm we need this.
  // let correctPercent = Math.round(100 * body.sum.correct / body.sum.total);
  // surveyResult[`${body.subtestId}.correct_percentage`] = `${correctPercent}%`
  surveyResult[`${body.subtestId}.timestamp_${subtestCounts.timestampCount}`] = moment(timestamp).format('hh:mm');

  return surveyResult;
}

/**
 * This function processes a grid prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed grid data.
 */

function processGridResult(body, subtestCounts, groupTimeZone, assessmentSuffix) {
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);
  let varName = body.data.variable_name || body.name.toLowerCase().replace(/\s/g, '_');
  let subtestId = body.subtestId;
  let gridResult = {};
  let suffix = subtestCounts.gridCount > 0 ? `_${subtestCounts.gridCount}` : '';
  let total = body.data.items.length;
  let correctSum = 0;

  gridResult[`${subtestId}.${varName}_auto_stop${suffix}`] = body.data.auto_stop;
  gridResult[`${subtestId}.${varName}_time_remain${suffix}`] = body.data.time_remain;
  gridResult[`${subtestId}.${varName}_capture_item_at_time${suffix}`] = body.data.capture_item_at_time;
  gridResult[`${subtestId}.${varName}_attempted${suffix}`] = body.data.attempted;
  gridResult[`${subtestId}.${varName}_time_intermediate_captured${suffix}`] = body.data.time_intermediate_captured;
  gridResult[`${subtestId}.${varName}_time_allowed${suffix}`] = body.data.time_allowed;

  for (doc of body.data.items) {
    let gridValue = doc.itemResult === 'correct' ? translateGridValue(doc.itemResult) : 0;
    gridResult[`${subtestId}.${varName}_${doc.itemLabel}`] = gridValue;
    correctSum += +gridValue;
  }

  let fluencyRate = Math.round(correctSum / (1 - body.data.time_remain / body.data.time_allowed));
  gridResult[`${subtestId}.fluency_rate${assessmentSuffix}`] = fluencyRate;
  gridResult[`${subtestId}.timestamp_${subtestCounts.timestampCount}`] = moment(timestamp).format('hh:mm');

  return gridResult;
}

/**
 * This function processes a gps prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed gps data.
 */

function processGpsResult(doc, subtestCounts, groupTimeZone) {
  let gpsResult = {};
  let suffix = subtestCounts.gpsCount > 0 ? `_${subtestCounts.gpsCount}` : '';
  let timestamp = convertToTimeZone(doc.timestamp, groupTimeZone);

  gpsResult[`${doc.subtestId}.latitude${suffix}`] = doc.data.lat;
  gpsResult[`${doc.subtestId}.longitude${suffix}`] = doc.data.long;
  gpsResult[`${doc.subtestId}.altitude${suffix}`] = doc.data.alt;
  gpsResult[`${doc.subtestId}.accuracy${suffix}`] = doc.data.acc;
  gpsResult[`${doc.subtestId}.altitudeAccuracy${suffix}`] = doc.data.altAcc;
  gpsResult[`${doc.subtestId}.heading${suffix}`] = doc.data.heading;
  gpsResult[`${doc.subtestId}.speed${suffix}`] = doc.data.speed;
  gpsResult[`${doc.subtestId}.timestamp_${subtestCounts.timestampCount}`] = moment(timestamp).format('hh:mm');

  return gpsResult;
}

/**
 * This function processes a camera prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {Object} subtestCounts - count.
 *
 * @returns {Object} processed camera data.
 */

function processCamera(body, subtestCounts, groupTimeZone) {
  let cameraResult = {};
  let varName = body.data.variableName;
  let suffix = subtestCounts.cameraCount > 0 ? `_${subtestCounts.cameraCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  cameraResult[`${body.subtestId}.${varName}_photo_captured${suffix}`] = body.data.imageBase64;
  cameraResult[`${body.subtestId}.${varName}_photo_url${suffix}`] = body.data.imageBase64;
  cameraResult[`${body.subtestId}.timestamp_${subtestsCount.timestampCount}`] = moment(timestamp).format('hh:mm');

  return cameraResult;
}

/**
 * This function maps a value in a result doc to a
 * value that will be represented in a csv file.
 *
 * @param {string} databaseValue - result value to be mapped.
 *
 * @returns {string} - translated survey value.
 */

function translateSurveyValue(databaseValue) {
  if (databaseValue == null) {
    databaseValue = 'no_record';
  }
  return surveyValueMap[databaseValue] || String(databaseValue);
};

/**
 * This function maps a value in a result doc to a
 * value that will be represented in a csv file.
 *
 * @param {string} databaseValue - result value to be mapped.
 *
 * @returns {string} - translated grid value.
 */

function translateGridValue(databaseValue) {
  if (databaseValue == null) {
    databaseValue = 'no_record';
  }
  return gridValueMap[databaseValue] || String(databaseValue);
};

/**
 * @description – This function checks the validity of the document
 * based on certain criteria.
 *
 * @param {object} doc - result collection.
 * @param {string} groupTimeZone - group time zone from db settings.
 * @param {string} dbUrl - database url.
 * @param {Array} allTimestamps - instrument timestamp from each subtest.
 *
 * @returns {object} - result validity and other metadata.
 */

async function validateResult(doc, groupTimeZone, dbUrl, allTimestamps) {
  let startTime, endTime, isValid, reason;
  let docId = doc.workflowId || doc.assessmentId || doc.curriculumId;
  let collection = await dbQuery.retrieveDoc(docId, dbUrl);
  let validationParams = collection.authenticityParameters;
  let instrumentConstraints = validationParams && validationParams.constraints;

  // Convert to time zone.
  let beginTimestamp = convertToTimeZone(allTimestamps[0], groupTimeZone);
  let endTimestamp = convertToTimeZone(allTimestamps[allTimestamps.length - 1], groupTimeZone);

  startTime = moment(beginTimestamp);
  endTime = moment(endTimestamp);

  if (validationParams && validationParams.enabled) {
    // check if assessment was captured between the given hours.
    let isStartTimeValid = startTime.hours() >= instrumentConstraints.timeOfDay.startTime.hour
    let isEndTimeValid = endTime.hours() <= instrumentConstraints.timeOfDay.endTime.hour;

    let isCapturedTimeValid = isStartTimeValid && isEndTimeValid;

    // TODO: Uncomment when weekday constraint is required.
    // check if assessment was captured during weekdays.
    // let isDuringWeekday = startTime.weekday > 0 && startTime.weekday < 6;

    // check if the difference between start time & end time of an assessment is more than a given duration
    let isDurationValid = endTime.diff(startTime, 'minutes') >= instrumentConstraints.duration.minutes;

    isValid = isCapturedTimeValid && isDurationValid;

    if (isCapturedTimeValid && isDurationValid) {
      reason = 'Accurate result';
    }

    if (!isCapturedTimeValid) {
      reason = 'Captured outside the working hours';
    }

    if (!isDurationValid) {
      reason = 'Less than expected duration';
    }

    if (isCapturedTimeValid == false && isDurationValid == false) {
      reason = 'Captured outside working hours & less than expected duration';
    }

  } else {
    isValid = true;
    reason = 'Validation params not enabled.';
  }

  return { startTime, endTime, isValid, reason };

}

/**
 * @description – This function converts a given timestamp
 * to its equivalent in the given timeZone.
 *
 * @param {string} timestamp - instrument timestamp
 * @param {string} timeZone - group time zone from db settings
 *
 * @returns {number} - timestamp in its appropriate time zone.
 */

function convertToTimeZone (timestamp, timeZone) {
  let offset = timeZone.split(':');
  offset = +offset[0];
  return timestamp + (offset * 60 * 60 * 1000);
}


exports.generateResult = generateResult;
