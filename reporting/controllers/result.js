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
const PouchDB = require('pouchdb');
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

exports.all = function(req, res) {
  const GROUP_DB = new PouchDB(req.body.baseDb);
  GROUP_DB.query('ojai/byCollection', { key: 'result', include_docs: true })
    .then((data) => res.json({ count: data.rows.length, results: data.rows }))
    .catch((err) => res.json(err));
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

exports.processResult = function(req, res) {
  const baseDb = req.body.baseDb;
  const resultDb = req.body.resultDb;
  const GROUP_DB = new PouchDB(baseDb);

  GROUP_DB.get(req.params.id)
    .then(async(data) => {
      let resultDoc = { doc: data };
      let result = await generateResult(resultDoc, 0, baseDb);
      let docId = result.indexKeys.collectionId;
      let groupTimeZone = result.indexKeys.groupTimeZone;
      let allTimestamps = _.sortBy(result.indexKeys.timestamps);

      // Validate result from all subtest timestamps
      let validationData = await validateResult(docId, groupTimeZone, baseDb, allTimestamps);
      result.isValid = validationData.isValid;
      result.isValidReason = validationData.reason;
      result[`${docId}.start_time`] = validationData.startTime;
      result[`${docId}.end_time`] = validationData.endTime;

      result.indexKeys.ref = result.indexKeys.ref;
      result.indexKeys.parent_id = docId;
      result.indexKeys.year = validationData.indexKeys.year;
      result.indexKeys.month = validationData.indexKeys.month;
      result.indexKeys.day = validationData.indexKeys.day;

      const saveResponse = await dbQuery.saveResult(result, resultDb);
      console.log(saveResponse);
      res.json(result);
    })
    .catch((err) => res.send(err));
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
 * @param {string} baseDb - database url.
 *
 * @returns {Object} - processed result for csv.
 */

const generateResult = async function(collections, count = 0, baseDb) {
  let enumeratorName, collection, collectionId, timestamps = [];
  let result = {};
  let indexKeys = {};
  let assessmentSuffix = count > 0 ? `_${count}` : '';
  let resultCollections = _.isArray(collections) ? collections : [collections];
  let dbSettings = await dbQuery.getSettings(baseDb);
  let groupTimeZone = dbSettings.timeZone || 0;

  for (let [index, data] of resultCollections.entries()) {
    collection = data.doc;
    collectionId = collection.workflowId || collection.assessmentId || collection.curriculumId;
    enumeratorName = collection.enumerator || collection.editedBy;
    if (collectionId == undefined) {
      break;
    }
    result[`${collectionId}.assessmentId${assessmentSuffix}`] = collectionId;
    result[`${collectionId}.assessmentName${assessmentSuffix}`] = collection.assessmentName;
    result[`${collectionId}.enumerator${assessmentSuffix}`] = enumeratorName.replace(/\s/g,'-');
    result[`${collectionId}.order_map${assessmentSuffix}`] = collection.order_map ? collection.order_map.join(',') : '';

    let subtestCount = {
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
        timestamps.push(doc.timestamp);
        if (doc.prototype === 'location') {
          let location = await processLocationResult(doc, subtestCount, groupTimeZone, baseDb);
          result = _.assignIn(result, location);
          subtestCount.locationCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'datetime') {
          let datetime = processDatetimeResult(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, datetime);
          subtestCount.datetimeCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'consent') {
          let consent = processConsentResult(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, consent);
          subtestCount.consentCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'id') {
          let id = processIDResult(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, id);
          subtestCount.idCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'survey') {
          let survey = processSurveyResult(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, survey);
          subtestCount.surveyCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'grid') {
          let grid = processGridResult(doc, subtestCount, groupTimeZone, assessmentSuffix);
          result = _.assignIn(result, grid);
          subtestCount.gridCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'gps') {
          let gps = processGpsResult(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, gps);
          subtestCount.gpsCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'camera') {
          let camera = processCamera(doc, subtestCount, groupTimeZone);
          result = _.assignIn(result, camera);
          subtestCount.cameraCount++;
          subtestCount.timestampCount++;
        }
        if (doc.prototype === 'complete') {
          let endTimestamp = convertToTimeZone(doc.data.end_time, groupTimeZone);
          result[`${collectionId}.end_time${assessmentSuffix}`] = moment(endTimestamp).format('MMM D YYYY hh:mm');
        }
      }
    }
  }

  if (collectionId != undefined) {
    indexKeys.groupTimeZone = groupTimeZone;
    indexKeys.timestamps = timestamps;
    indexKeys.collectionId = collectionId;
    indexKeys.ref = collection.workflowId ? collection.tripId : collection._id;
    result.indexKeys = indexKeys;

    // Include user metadata
    let username = `user-${enumeratorName}`;
    try {
      let userDetails = await dbQuery.getUserDetails(username, baseDb);
      result[`${collectionId}.userRole`] = userDetails.role;
      result[`${collectionId}.mPesaNumber`] = userDetails.mPesaNumber;
      result[`${collectionId}.phoneNumber`] = userDetails.phoneNumber || userDetails.phone;
      result[`${collectionId}.fullName`] = `${userDetails.firstName || userDetails.first} ${userDetails.lastName || userDetails.last}`;
    } catch (err) {
      console.error({ message: 'Could not find user metadata', reason: err.message });
    }
  }

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
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 * @param {string} baseDb - base database url.
 *
 * @returns {Object} processed location data.
 */

async function processLocationResult(body, subtestCount, groupTimeZone, baseDb) {
  let i, j, locationResult = {};
  let locSuffix = subtestCount.locationCount > 0 ? `_${subtestCount.locationCount}` : '';
  let subtestId = body.subtestId;
  let locLabels = body.data.labels;
  let locationData = body.data.location;
  let schoolId = body.data.schoolId;
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  // check if the geographical level is available
  let allSubtestData = await dbQuery.getSubtests(doc.assessmentId, baseDb);
  let locationSubtest = _.find(allSubtestData, ['_id', subtestId ])
  let locLevels = locationSubtest.levels;
  let isLocLevelSet = (locLevels && locLevels.length > 0) && (locLevels && locLevels[0] !== '');

  // if the location levels is not available then check the location-list
  if (!isLocLevelSet || schoolId) {
    let locationNames = await getLocationName(body, baseDb);
    let locKeys = Object.keys(locationNames);
    if (locKeys.length > 0) {
      for (j = 0; j < locKeys.length; j++) {
        let key = locKeys[j];
        let location = locationNames[key] ? locationNames[key].label : locationNames[key];
        locationResult[`${subtestId}.${locKeys[j]}${locSuffix}`] = location ? location.replace(/\s/g,'-') : location;
      }
    }
  }
  else {
    for (i = 0; i < locLabels.length; i++) {
      locationResult[`${subtestId}.${locLabels[i]}`] = locationData[i];
    }
  }
  locationResult[`${subtestId}.timestamp_${subtestCount.locationCount}`] = moment(timestamp).format('MMM D YYYY hh:mm');

  return locationResult;
}

/**
 * @description – This function retrieves the county,
 * subcounty, zone and school data from the location list.
 *
 * @param {object} body - subtest location details.
 * @param {string} baseDb - base database url.
 *
 * @returns {object} - An object containing the county,
 *  subcounty, zone & school data.
 */

async function getLocationName(body, baseDb) {
  let i, j, locNames = {}, locIds = [];
  let schoolId = body.data.schoolId;

  // retrieve location-list from the base database.
  let locationList = await dbQuery.getLocationList(baseDb);
  let levels = locationList.locationsLevels;
  let locLabels = body.data.labels.map(label => label.toLowerCase());
  let isLocationListSet = !(_.isEmpty(locationList.locations));

  if (schoolId) {
    for (j = 0; j < levels.length; j++) {
      locNames[levels[j]] = {};
      let level = levels[j] === 'school' ? 'schoolname' : levels[j];
      let index = locLabels.indexOf(level);
      locNames[levels[j]]['label'] = body.data.location[index].toLowerCase();
    }
    return locNames;
  } else {
    locIds = body.data.location;
  }

  //Note: this location details processes up to 4 levels and not more.
  //@TODO: Update it to accommodate more than 4 levels.
  if (isLocationListSet) {
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
          locNames[levels[i+2]] = _.get(locNames[levels[i+1]].children, locIds[i+2]);

          if (locNames[levels[i+2]]) {
            locNames[levels[i+3]] = _.get(locNames[levels[i+2]].children, locIds[i+3]);
          }
        }
        break;
      }
    }
  }

  return locNames;
}

/**
 * This function processes result for a datetime prototype.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed datetime data.
 */

function processDatetimeResult(body, subtestCount, groupTimeZone) {
  let suffix = subtestCount.datetimeCount > 0 ? `_${subtestCount.datetimeCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  datetimeResult = {
    [`${body.subtestId}.year${suffix}`]: body.data.year,
    [`${body.subtestId}.month${suffix}`]: body.data.month,
    [`${body.subtestId}.day${suffix}`]: body.data.day,
    [`${body.subtestId}.assess_time${suffix}`]: body.data.time,
    [`${body.subtestId}.timestamp_${subtestCount.timestampCount}`]: moment(timestamp).format('MMM D YYYY hh:mm')
  }
  return datetimeResult;
}

/**
 * This function processes a consent prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed consent data.
 */

function processConsentResult(body, subtestCount, groupTimeZone) {
  let suffix = subtestCount.consentCount > 0 ? `_${subtestCount.consentCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  consentResult = {
    [`${body.subtestId}.consent${suffix}`]: body.data.consent,
    [`${body.subtestId}.timestamp_${subtestCount.timestampCount}`]: moment(timestamp).format('MMM D YYYY hh:mm')
  };
  return consentResult;
}

/**
 * This function processes an id prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed id data.
 */

function processIDResult(body, subtestCount, groupTimeZone) {
  let suffix = subtestCount.idCount > 0 ? `_${subtestCount.idCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  idResult = {
    [`${body.subtestId}.id${suffix}`]: body.data.participant_id,
    [`${body.subtestId}.timestamp_${subtestCount.timestampCount}`]: moment(timestamp).format('MMM D YYYY hh:mm')
  };
  return idResult;
}

/**
 * This function processes a survey prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed survey data.
 */

function processSurveyResult(body, subtestCount, groupTimeZone) {
  let count = subtestCount.surveyCount;
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);
  let surveyResult = {};

  for (doc in body.data) {
    if (typeof body.data[doc] === 'object') {
      for (item in body.data[doc]) {
        let surveyValue = translateSurveyValue(body.data[doc][item]);
        surveyResult[`${body.subtestId}.${doc}_${item}`] = surveyValue;
      }
    } else {
      let value = translateSurveyValue(body.data[doc]);
      surveyResult[`${body.subtestId}.${doc}`] = value;
    }
  }
  surveyResult[`${body.subtestId}.timestamp_${subtestCount.timestampCount}`] = moment(timestamp).format('MMM D YYYY hh:mm');

  return surveyResult;
}

/**
 * This function processes a grid prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 * @param {number} assessmentSuffix - assessment count.
 *
 * @returns {Object} processed grid data.
 */

function processGridResult(body, subtestCount, groupTimeZone, assessmentSuffix) {
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);
  let varName = body.data.variable_name || body.name.toLowerCase().replace(/\s/g, '_');
  let subtestId = body.subtestId;
  let gridResult = {};
  let suffix = subtestCount.gridCount > 0 ? `_${subtestCount.gridCount}` : '';
  let total = body.data.items.length;
  let correctSum = 0;

  gridResult[`${subtestId}.${varName}_auto_stop${suffix}`] = body.data.auto_stop;
  gridResult[`${subtestId}.${varName}_time_remain${suffix}`] = body.data.time_remain;
  gridResult[`${subtestId}.${varName}_capture_item_at_time${suffix}`] = body.data.capture_item_at_time;
  gridResult[`${subtestId}.${varName}_attempted${suffix}`] = body.data.attempted;
  gridResult[`${subtestId}.${varName}_time_intermediate_captured${suffix}`] = body.data.time_intermediate_captured;
  gridResult[`${subtestId}.${varName}_time_allowed${suffix}`] = body.data.time_allowed;

  for (let [index, doc] of body.data.items.entries()) {
    let gridValue = doc.itemResult === 'correct' ? translateGridValue(doc.itemResult) : 0;
    gridResult[`${subtestId}.${varName}_${index + 1}`] = gridValue;
    correctSum += +gridValue;
  }

  let fluencyRate = Math.round(correctSum / (1 - body.data.time_remain / body.data.time_allowed));
  gridResult[`${subtestId}.fluency_rate${assessmentSuffix}`] = fluencyRate;
  gridResult[`${subtestId}.timestamp_${subtestCount.timestampCount}`] = moment(timestamp).format('MMM D YYYY hh:mm');

  return gridResult;
}

/**
 * This function processes a gps prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed gps data.
 */

function processGpsResult(doc, subtestCount, groupTimeZone) {
  let gpsResult = {};
  let suffix = subtestCount.gpsCount > 0 ? `_${subtestCount.gpsCount}` : '';
  let timestamp = convertToTimeZone(doc.timestamp, groupTimeZone);

  gpsResult[`${doc.subtestId}.latitude${suffix}`] = doc.data.lat;
  gpsResult[`${doc.subtestId}.longitude${suffix}`] = doc.data.long;
  gpsResult[`${doc.subtestId}.altitude${suffix}`] = doc.data.alt;
  gpsResult[`${doc.subtestId}.accuracy${suffix}`] = doc.data.acc;
  gpsResult[`${doc.subtestId}.altitudeAccuracy${suffix}`] = doc.data.altAcc;
  gpsResult[`${doc.subtestId}.heading${suffix}`] = doc.data.heading;
  gpsResult[`${doc.subtestId}.speed${suffix}`] = doc.data.speed;
  gpsResult[`${doc.subtestId}.timestamp_${subtestCount.timestampCount}`] = moment(timestamp).format('MMM D YYYY hh:mm');

  return gpsResult;
}

/**
 * This function processes a camera prototype subtest data.
 *
 * @param {Object} body - document to be processed.
 * @param {string} subtestCount - count.
 * @param {string} groupTimeZone - time zone from db settings.
 *
 * @returns {Object} processed camera data.
 */

function processCamera(body, subtestCount, groupTimeZone) {
  let cameraResult = {};
  let varName = body.data.variableName || body.name;
  let suffix = subtestCount.cameraCount > 0 ? `_${subtestCount.cameraCount}` : '';
  let timestamp = convertToTimeZone(body.timestamp, groupTimeZone);

  cameraResult[`${body.subtestId}.${varName}_photo_captured${suffix}`] = body.data.imageBase64;
  cameraResult[`${body.subtestId}.${varName}_photo_url${suffix}`] = body.data.imageBase64;
  cameraResult[`${body.subtestId}.timestamp_${subtestCount.timestampCount}`] = moment(timestamp).format('MMM D YYYY hh:mm');

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
 * @param {object} docId - result collection id.
 * @param {string} groupTimeZone - group time zone from db settings.
 * @param {string} baseDb - base database url.
 * @param {Array} allTimestamps - instrument timestamp from each subtest.
 *
 * @returns {object} - result validity and other metadata.
 */

async function validateResult(docId, groupTimeZone, baseDb, allTimestamps) {
  let startTime, endTime, isValid, reason;
  let validData = { indexKeys: {} };
  let GROUP_DB = new PouchDB(baseDb);
  let collection = await GROUP_DB.get(docId);
  let validationParams = collection.authenticityParameters;
  let instrumentConstraints = validationParams && validationParams.constraints;

  // Convert to time zone from db settings.
  let beginTimestamp = convertToTimeZone(allTimestamps[0], groupTimeZone);
  let endTimestamp = convertToTimeZone( allTimestamps[allTimestamps.length - 1], groupTimeZone);

  startTime = moment(beginTimestamp);
  endTime = moment(endTimestamp);

  if (validationParams && validationParams.enabled) {
    // check if assessment was captured between the given hours.
    let isStartTimeValid = startTime.hours() >= instrumentConstraints.timeOfDay.startTime.hour;
    let isEndTimeValid = endTime.hours() <= instrumentConstraints.timeOfDay.endTime.hour;

    let isCapturedTimeValid = isStartTimeValid && isEndTimeValid;

    // check if the difference between start time & end time of an assessment is more than a given duration
    let isDurationValid = endTime.diff(startTime, 'minutes') >=instrumentConstraints.duration.minutes;

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

  validData[`${docId}.start_time`] = startTime;
  validData[`${docId}.end_time`] = endTime;
  validData.isValid = isValid;
  validData.reason = reason;
  validData.indexKeys.year = moment(startTime).year();
  validData.indexKeys.month = moment(startTime).format("MMM");
  validData.indexKeys.day = moment(startTime).date();
  validData.indexKeys.parent_id = docId;

  return validData;
}

/**
 * @description – This function converts a given timestamp
 * to its equivalent in the given timeZone.
 *
 * @param {string} timestamp - instrument timestamp
 * @param {string} timeZone - group time zone from db settings
 *
 * @returns {number} - timestamp in its appropriate time zone from db settings.
 */

function convertToTimeZone(timestamp, timeZone) {
  let offset;
  if (timeZone) {
    offset = timeZone.split(':');
    offset = +offset[0];
  } else {
    offset = 0;
  }
  return timestamp + (offset * 60 * 60 * 1000);
}

exports.generateResult = generateResult;

exports.validateResult = validateResult;
