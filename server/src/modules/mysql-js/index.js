const DB = require('../../db.js')
const log = require('tangy-log').log
const fs = require('fs-extra');
const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const path = require('path')
const exec = util.promisify(require('child_process').exec)
const fsCore = require('fs');
const readFile = util.promisify(fsCore.readFile);
const tangyModules = require('../index.js')()
const sanitize = require("sanitize-filename");

/* Enable this if you want to run commands manually when debugging.
const exec = async function(cmd) {
  console.log(cmd) 
}
*/

module.exports = {
  name: 'mysql-js',
  connection: null,
  hooks: {
    boot: async function(data) {
      return data
    },
    enable: async function() {
      const groups = await groupsList()
      for (let i = 0; i < groups.length; i++) {
        const groupId = groups[i]
        await initializeGroupForMySQL(groupId)
      }
    },
    disable: function(data) {

    },
    groupNew: async function(data) {
      const {groupName} = data
      const groupId = groupName
      await initializeGroupForMySQL(groupId)
      return data
    },
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let i = 0; i < groupNames.length; i++) {
        const groupName = groupNames[i]
        try {
          await removeGroupForMySQL(groupName)
        } catch (e) {
          console.log("error: " + e)
        }
        try {
          await initializeGroupForMySQL(groupName)
        } catch (e) {
          console.log("error: " + e)
        }
      }
      return data
    },
    reportingOutputs: async function(data) {
      async function addDocument(sourceDb, doc, sanitized, exclusions) {
        const tablenameSuffix = ''
        if (exclusions && exclusions.includes(doc.form.id)) {
          // skip!
        } else {
          let knex
          try {
            knex = require('knex')({
              client: 'mysql2',
              connection: {
                host: `${process.env.T_MYSQL_CONTAINER_NAME}`,
                port: 3306,
                user: `${process.env.T_MYSQL_USER}`,
                password: `${process.env.T_MYSQL_PASSWORD}`
              }
            });
          } catch (e) {
            log.debug(`Error connecting to database: ${process.env.T_MYSQL_CONTAINER_NAME} using ${process.env.T_MYSQL_USER}: ${e}`)
            throw new Error(e)
          }
          let tableName, docType, createFunction, primaryKey
          if (doc.type === 'case') {
            // output case
            const flatDoc = await prepareFlatData(doc, sanitized);
            log.info("Saving case_instance to MySQL doc _id: " + doc._id)
            // case doc
            tableName = 'case_instances' + tablenameSuffix
            docType = 'case'
            primaryKey = 'CaseID'
            createFunction = function (t) {
              t.engine('InnoDB')
              t.string(primaryKey, 36).notNullable().primary();
              t.integer('complete');
              t.bigint('startunixtime');//TODO: is this being set properly in mysql?
            }
            const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
            
            // output participants
            for (let i = 0; i < doc.participants.length; i++) {
              const participant = doc.participants[i]
              let participant_id = participant.id
              let key_len = 32
              if (process.env.T_MYSQL_MULTI_PARTICIPANT_SCHEMA) {
                participant_id = doc._id + '-' + participant.id
                key_len = 80
              }
              const flatDoc = stringifyDocDataObjects({
                ...participant,
                _id: participant_id,
                caseId: doc._id,
                participantId: participant.id,
                type: "participant",
                groupId: doc.groupId,
                archived: doc.archived||''
              })

              tableName = 'participant' + tablenameSuffix
              docType = 'participant'
              primaryKey = 'participantID'
              createFunction = function (t) {
                t.engine('InnoDB')
                t.string(primaryKey, key_len).notNullable().primary();
                t.string('CaseID', key_len).index('participant_CaseID_IDX');
                t.double('inactive');
              }
              const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
              log.info('Processed: ' + JSON.stringify(result))
            }
            // log.debug("doc.events.length: " + doc.events.length)
            for (let j = 0; j < doc.events.length; j++) {
              const event = doc.events[j]
              // log.debug("Event: " + JSON.stringify(event))
              // output event-forms
              if (event['eventForms']) {
                // for (const eventForm of event['eventForms']) {
                // log.debug("event['eventForms'].length: " + event['eventForms'].length)
                for (let k = 0; k < event['eventForms'].length; k++) {
                  const eventForm = event['eventForms'][k]
                  // for (let index = 0; index < event['eventForms'].length; index++) {
                  // const eventForm = event['eventForms'][index]
                  let flatDoc;
                  const eventFormDoc = {...eventForm, type: "event-form", _id: eventForm.id, groupId: doc.groupId, archived: doc.archived}
                  try {
                    flatDoc = stringifyDocDataObjects(eventFormDoc)
                  } catch (e) {
                    if (e.status !== 404) {
                      console.log("Error processing eventForm. caseID:  " + doc.caseId + " Error: " + JSON.stringify(e) + " e: " + e)
                    }
                  }
                  // log.info("flatDoc eventForm: " + JSON.stringify(flatDoc))
                  tableName = 'eventform' + tablenameSuffix
                  docType = 'event-form'
                  primaryKey = 'EventFormID'
                  createFunction = function (t) {
                    t.engine('InnoDB')
                    t.string(primaryKey, 36).notNullable().primary();
                    t.string('caseId', 36).index('eventform_caseId_IDX');
                    t.string('caseEventId', 36).index('eventform_caseEventId_IDX');
                    t.integer('complete');
                    t.integer('required');
                  }
                  const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
                  log.info('Processed: ' + JSON.stringify(result))
                }
              } else {
                console.log("Mysql - NO eventForms! doc _id: " + doc._id + " in database " +  sourceDb.name + " event: " + JSON.stringify(event))
              }
              // output case-events
              
              // Make a clone of the event so we can delete part of it but not lose it in other iterations of this code
              // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
              const eventClone = Object.assign({}, event);
              // Delete the eventForms array from the case-event object - we don't want this duplicate structure 
              // since we are already serializing each event-form and have the parent caseEventId on each one.
              delete eventClone.eventForms
              const caseEventDoc = {...eventClone, _id: eventClone.id, type: "case-event", groupId: doc.groupId, archived: doc.archived}
              const flatDoc = stringifyDocDataObjects(caseEventDoc)
              tableName = 'caseevent' + tablenameSuffix
              docType = 'case-event'
              primaryKey = 'CaseEventID'
              createFunction = function (t) {
                t.engine('InnoDB')
                t.string(primaryKey, 36).notNullable().primary();
                t.string('caseId', 36).index('caseevent_caseId_IDX');
                t.integer('complete');
                t.integer('estimate');
                t.integer('startDate');
              }
              const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
              log.info('Processed: ' + JSON.stringify(result))
            }
          } else if (doc.type === 'issue') {
            const flatDoc = await prepareFlatData(doc, sanitized);
            // issue doc
            tableName = 'issue' + tablenameSuffix
            docType = 'issue'
            primaryKey = 'ID'
            createFunction = function (t) {
              t.engine('InnoDB')
              t.string(primaryKey, 36).notNullable().primary();
              t.string('caseId', 36) // .index('response_caseId_IDX');
              t.string('participantID', 36) //.index('case_instances_ParticipantID_IDX');
              t.string('caseEventId', 36) // .index('eventform_caseEventId_IDX');
              t.tinyint('complete');
              t.string('archived', 36); // 
            }
            const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
          } else if (doc.type === 'response') {
            const flatDoc = await prepareFlatData(doc, sanitized);
            tableName = null;
            docType = 'response';
            primaryKey = 'ID'
            createFunction = function (t) {
              t.engine('InnoDB')
              t.string(primaryKey, 200).notNullable().primary();
              t.string('caseId', 36) // .index('response_caseId_IDX');
              t.string('participantID', 36) //.index('case_instances_ParticipantID_IDX');
              t.string('caseEventId', 36) // .index('eventform_caseEventId_IDX');
              t.tinyint('complete');
              t.string('archived', 36); // TODO: "sqlMessage":"Incorrect integer value: '' for column 'archived' at row 1
            }
            const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
          } else {
            const flatDoc = await prepareFlatData(doc, sanitized);
            tableName = flatDoc.type;
            console.log("tableName: " + tableName)
            docType = 'response';
            primaryKey = 'ID'
            createFunction = function (t) {
              t.engine('InnoDB')
              t.string(primaryKey, 200).notNullable().primary();
              t.string('caseId', 36) // .index('response_caseId_IDX');
              t.string('participantID', 36) //.index('case_instances_ParticipantID_IDX');
              t.string('caseEventId', 36) // .index('eventform_caseEventId_IDX');
              t.tinyint('complete');
              t.string('archived', 36); // TODO: "sqlMessage":"Incorrect integer value: '' for column 'archived' at row 1
            }
            const result = await saveToMysql(knex, sourceDb,flatDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
          }

          await knex.destroy()
        }
      }
        
      const {doc, sourceDb} = data
      const locationLists = tangyModules.getLocationLists(sourceDb.name)
      // const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
      const groupsDb = await new DB(`groups`);
      const groupDoc = await groupsDb.get(`${sourceDb.name}`)
      const exclusions = groupDoc['exclusions']
      let sanitized = false;
      await addDocument(sourceDb, doc, sanitized, exclusions);
      return data
    }
  }
}

async function removeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  try {
    await exec(`mysql -u ${process.env.T_MYSQL_USER} -h ${process.env.T_MYSQL_CONTAINER_NAME} -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP DATABASE ${mysqlDbName};"`)
  } catch (e) {
    log.error(e)
  }
  try {
    const pathToStateFile = `/mysql-module-state/${groupId}.ini`
    await fs.unlink(pathToStateFile)
    console.log(`Removed legacy state file and database for ${groupId}`)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return;
    } else {
      log.error(e)
    }
  }
 
}

async function initializeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  // console.log(`Creating mysql db ${mysqlDbName}`)
  // try {
  //   await exec(`mysql -u ${process.env.T_MYSQL_USER} -h ${process.env.T_MYSQL_CONTAINER_NAME} -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
  // } catch (e) {
  //   console.log(`Error creating mysql db ${mysqlDbName}`)
  //   console.log(e)
  // }
  const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: `${process.env.T_MYSQL_CONTAINER_NAME}`,
      port: 3306,
      user: `${process.env.T_MYSQL_USER}`,
      password: `${process.env.T_MYSQL_PASSWORD}`
    }
  })
  try {
    await knex.raw('CREATE DATABASE ' + mysqlDbName)
  } catch (e) {
    log.debug(e)
  }
  await knex.destroy()
  console.log(`Created mysql db ${mysqlDbName}`)
}

const getItemValue = (doc, variableName) => {
  const variablesByName = doc.items.reduce((variablesByName, item) => {
    for (const input of item.inputs) {
      variablesByName[input.name] = input.value;
    }
    return variablesByName;
  }, {});
  return variablesByName[variableName];
};


/** This function processes form response, making the data structure flatter.
 *
 * @param {object} formData - form response from database
 * @param {boolean} sanitized - flag if data must filter data based on the identifier flag.
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, sanitized) {
  const groupId = formResponse.groupId;

  // Anything added to this list need to be added to the valuesToRemove list in each of the convert_response function.
  let flatFormResponse = {
    _id: formResponse._id,
    formTitle: formResponse.form.title,
    startUnixtime: formResponse.startUnixtime,
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: groupId||'',
    complete: formResponse.complete,
    archived: formResponse?.archived||'',
    tangerineModifiedOn: formResponse?.tangerineModifiedOn||'',
    tangerineModifiedByUserId: formResponse?.tangerineModifiedByUserId||'',
    verified: formResponse?.verified||''
  };

  if (!formResponse.formId) {
    if (formResponse.form.id === '') {
      formResponse.form.id = 'blank'
    }
    console.log('formResponse.form.id: ' + formResponse.form.id)
    flatFormResponse['formId'] = formResponse.form.id
  }

  if (formResponse.type === 'attendance' || formResponse.type === 'behavior' || formResponse.type === 'scores' ||
      formResponse.form.id === 'student-registration' ||
      formResponse.form.id === 'class-registration') {

    function hackFunctionToRemoveUserProfileId (formResponse) {
      // This is a very special hack function to remove userProfileId
      // It needs to be replaced with a proper solution that resolves duplicate variables.
      if (formResponse.userProfileId) {
        for (let item of formResponse.items) {
          for (let input of item.inputs) {
            if (input.name === 'userProfileId') {
              delete formResponse.userProfileId;
            }
          }
        }
      }
      return formResponse;
    }

    formResponse = hackFunctionToRemoveUserProfileId(formResponse);

    if (formResponse.type === 'attendance') {
      flatFormResponse['attendanceList'] = formResponse.attendanceList
    } else if (formResponse.type === 'behavior') {
      // flatFormResponse['studentBehaviorList'] = formResponse.studentBehaviorList
      const studentBehaviorList = formResponse.studentBehaviorList.map(record => {
        const student = {}
        Object.keys(record).forEach(key => {
          if (key === 'behavior') {
            student[key + '.formResponseId'] = record[key]['formResponseId']
            student[key + '.internal'] = record[key]['internal']
            student[key + '.internalPercentage'] = record[key]['internalPercentage']
            // console.log("special processing for behavior: " + JSON.stringify(student) )
          } else {
            // console.log("key: " + key + " record[key]: " + record[key])
            student[key] = record[key]
          }
        })
        return student
      })
      flatFormResponse['studentBehaviorList'] = studentBehaviorList
    } else if (formResponse.type === 'scores') {
      flatFormResponse['scoreList'] = formResponse.scoreList
    }
  }

  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      let sanitize = false;
      if (sanitized) {
        if (input.identifier) {
          sanitize = true
        }
      }
      if (!sanitize) {
        // Simplify the keys by removing formID.itemId
        let firstIdSegment = ""
        if (input.tagName === 'TANGY-LOCATION') {
          // Populate the id, label and metadata columns for TANGY-LOCATION levels in the current location list.
          // The location list may be change over time. When values are changed, we attempt to adjust 
          // so the current values appear in the outputs.
  
          // This input has an attribute 'locationSrc' with a path to the location list that starts with './assets/'
          // We need to compare file names instead of paths since it is different on the server
          const locationSrc = input.locationSrc ? path.parse(input.locationSrc).base : `location-list.json`
          const locationList = await tangyModules.getLocationListsByLocationSrc(groupId, locationSrc)
          locationKeys = []
          for (let group of input.value) {
            tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}.${group.level}`, group.value)
            locationKeys.push(group.value)
  
            if (!locationList) {
              // Since tangy-form v4.42.0, tangy-location widget saves the label in the value
              // use the label value saved in the form response if it is not found in the current location list.
              // If no label appears in the form response, then we put 'orphanced' for the label. 
              const valueLabel = group.label ? group.label : 'orphaned'
              tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}.${group.level}_label`, valueLabel)
            } else {
              try {
                const location = getLocationByKeys(locationKeys, locationList)
                for (let keyName in location) {
                  if (['descendantsCount', 'children', 'parent', 'id'].includes(keyName)) {
                    continue
                  }
                  tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}.${group.level}_${keyName}`, location[keyName])                
                }
              } catch (e) {
                const valueLabel = group.label ? group.label : 'orphaned'
                tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}.${group.level}_label`, valueLabel)
              }
            }
          }
        } else if (input.tagName === 'TANGY-RADIO-BUTTONS' && Array.isArray(input.value)) {
          let selectedOption = input.value.find(option => !!option.value) 
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, selectedOption ? selectedOption.name : '')
        } else if (input.tagName === 'TANGY-PHOTO-CAPTURE') {
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, input.value ? 'true' : 'false')
        } else if (input.tagName === 'TANGY-VIDEO-CAPTURE') {
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, input.value ? 'true' : 'false')
        } else if (input.tagName === 'TANGY-BOX' || (input.tagName === 'TANGY-TEMPLATE' && input.value === undefined) || input.name === '') {
          // Do nothing :).
        } else if (input.tagName === 'TANGY-SIGNATURE') {
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, input.value ? 'true' : 'false')
        } else if (input && typeof input.value === 'string') {
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, input.value)
        } else if (input && typeof input.value === 'number') {
          tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}`, input.value)
        } else if (input && Array.isArray(input.value)) {
          let i = 0
          for (let group of input.value) {
            i++
            let keyName = group.name
            if (!group.name) {
              keyName = i
            }
            tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}_${keyName}`, group.value)
          }
        } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
          let elementKeys = Object.keys(input.value);
          let i = 0
          for (let key of elementKeys) {
            i++
            let keyName = key
            if (!key) {
              keyName = i
            }
            tangyModules.setVariable(flatFormResponse, input, `${firstIdSegment}${input.name}_${keyName}`, input.value[key])
          }
        }
      } // sanitize
    }
  }
  return flatFormResponse;
};

/**
 * Stringifies objects in doc.data
 * @param doc
 * @returns {{data}|*}
 */
function stringifyDocDataObjects(doc) {
  // If there are any objects/arrays in the flatResponse, stringify them. Also make all property names lowercase 
  // to avoid duplicate column names (example: ID and id are different in python/js, but the same for MySQL leading 
  // attempting to create duplicate column names of id and ID).
  if (doc.data && typeof doc.data === 'object') {
    doc.data = Object.keys(doc.data).reduce((acc, key) => {
      return {
        ...acc,
        ...key === ''
          ? {}
          : {
            [key.toLowerCase()]: typeof doc.data[key] === 'object'
              ? JSON.stringify(doc.data[key])
              : doc.data[key]
          }
      }
    }, {})
  }
  return doc
}

async function prepareFlatData(doc, sanitized) {
  let flatResponse = await generateFlatResponse(doc, sanitized);
  // If there are any objects/arrays in the flatResponse, stringify them. Also make all property names lowercase to avoid duplicate column names (example: ID and id are different in python/js, but the same for MySQL leading attempting to create duplicate column names of id and ID).
  flatResponse = Object.keys(flatResponse).reduce((acc, key) => {
    return {
      ...acc,
      ...key === ''
        ? {}
        : {
          [key.toLowerCase()]: typeof flatResponse[key] === 'object'
            ? JSON.stringify(flatResponse[key])
            : flatResponse[key]
        }
    }
  }, {})
  // make sure the top-level properties of doc are copied.
  const topDoc = {}
  Object.entries(doc).forEach(([key, value]) => value === Object(value) ? null : topDoc[key] = value);
  const flatDoc = stringifyDocDataObjects({
    ...topDoc,
    data: flatResponse
  })
  return flatDoc
}

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}

// From: https://stackoverflow.com/a/61602592
const flatten = (obj, roots = [], sep = '.') => Object
  // find props of given object
  .keys(obj)
  // return an object by iterating props
  .reduce((memo, prop) => Object.assign(
    // create a new object
    {},
    // include previously returned object
    memo,
    Object.prototype.toString.call(obj[prop]) === '[object Object]'
      // keep working if value is an object
      ? flatten(obj[prop], roots.concat([prop]))
      // include current prop and value and prefix prop with the roots
      : {[roots.concat([prop]).join(sep)]: obj[prop]}
  ), {})

/**
 * Escapes special characters in the replace param.
 * thanks to https://stackoverflow.com/a/14822579
 * @param key
 * @returns {*}
 */
function sanitizeMysql(key) {
  const find = '.'
  const replace = '_'
  const sanitizedKey = key.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
  return sanitizedKey
}

function populateDataFromDocument(doc, data) {
  const cleanData = {}
  // data.forEach(e => {
  //   cleanData[e]
  // })
  // const infoKeys = Object.keys(data)
  for (let [key, value] of Object.entries(data)) {
    const sanitizedKey = sanitize(key)
    // let keySafe = SqlString.escapeId(sanitizedKey, true)
    // const keySafe = sanitizedKey.replace(/\./g,'_')
    const keySafe = sanitizeMysql(sanitizedKey)
    // log.info(`key: ${key}; keySafe: ${keySafe}; value: ${value}`)
    cleanData[keySafe] = value
  }
// # Check to see if we have any additional data elements that we need to convert and save to MySQL database.
  if (doc) {
    for (let [key, value] of Object.entries(doc)) {
      if (doc.hasOwnProperty(key) && key !== 'data') {
        // log.info(`key: ${key}; value: ${value}`)
        try {
          // thanks to https://stackoverflow.com/a/14822579
          // const find = '.'
          // const replace = '_'
          // key = key.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
          const sanitizedKey = sanitize(key)
          // let keySafe = SqlString.escapeId(sanitizedKey, true)
          // const keySafe = sanitizedKey.replace(/\./g,'_')
          const keySafe = sanitizeMysql(sanitizedKey)
          // log.info(`key: ${key}; keySafe: ${keySafe}; value: ${value}`)
          cleanData[keySafe] = value
        } catch (e) {
          log.info(`ERROR: key: ${key}; value: ${value}; e: ${e}`)
        }
      }
    }
  }
  return cleanData
}

async function convert_participant(knex, doc, groupId, tableName) {
  if (!tableName) {
    tableName = 'participant'
  }
  const caseId = doc.caseId
  const participantId = doc._id
  const dbRev = doc._rev
  const role = doc.caseRoleId
  const data = doc.data
  let newRecord = false
  if (data['participantID']) {
    // log.info('Already have participantID: ' + participantId)
  } else {
    // log.info('Adding record for participantID: ' + participantId)
    data['participantID'] = participantId
  }
  if (!data['CaseID']) {
    data['CaseID'] = caseId
  }
  if (!data['caseRoleId']) {
    data['caseRoleId'] = role
  }
  if (!data['dbRevision']) {
    data['dbRevision'] = dbRev
  }
  // log.info(`data: ${JSON.stringify(data)}`)
  // log.info(`doc: ${JSON.stringify(doc)}`)

  // # Delete the following keys;
  const valuesToRemove = ['data', 'caseId', 'participantId', '_id', '_rev', 'caseRoleId', 'id', 'type']
  // const filteredParticipantData = data.filter(item => !valuesToRemove.includes(item))
  valuesToRemove.forEach(e => delete doc[e]);
  // log.info(`doc: ${JSON.stringify(doc)}`)

  const cleanData = populateDataFromDocument(doc, data);

  return cleanData
}

async function convert_case(knex, doc, groupId, tableName) {
  // console.log("convert_case doc: " + JSON.stringify(doc))
  const caseDefID = doc.caseDefinitionId
  const caseId = doc._id
  const dbRev = doc._rev
  const collection = doc.collection
  const startDatetime = doc.startDatetime
  const uploadDatetime = doc.uploadDatetime
  const data = doc.data

  if (!data['caseDefinitionId']) {
    data['caseDefinitionId'] = caseDefID
  }
  if (!data['dbRevision']) {
    data['dbRevision'] = dbRev
  }
  if (!data['collection']) {
    data['collection'] = collection
  }
  if (!data['startDatetime']) {
    data['startDatetime'] = startDatetime
  }
  if (!data['uploadDatetime']) {
    data['uploadDatetime'] = uploadDatetime
  }
  if (!data['CaseID']) {
    data['CaseID'] = caseId
  }
  if (!data['type']) {
    data['type'] = 'case'
  }
  return data
}

async function convert_case_event(knex, doc, groupId, tableName) {
  const data = {}
  doc.CaseEventID = doc._id
  doc.dbRevision = doc._rev
  // # Delete the following keys;
  const valuesToRemove = ['id', '_id', '_rev']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function convert_event_form(knex, doc, groupId, tableName) {
  let data = doc.data
  if (!data) {
    data = {}
  }
  doc.EventFormID = doc._id
  doc.dbRevision = doc._rev
  // # Delete the following keys;
  const valuesToRemove = ['id', '_id', '_rev']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function convert_response(knex, doc, groupId, tableName) {
  let data = doc.data
  if (!data) {
    data = {}
  }

  const id= doc._id
  const startDatetime = doc.startDatetime
  const geoIp = doc.geoip
  const caseId = doc.caseId
  const eventId = doc.eventId
  const eventFormId=  doc.eventFormId
  const participantId = doc.participantId
  const caseEventId = doc.caseEventId

  var formID = doc.formId || data['formid']
  console.log("formID: " + formID)
  if (formID) {
    // thanks to https://stackoverflow.com/a/14822579
    const find = '-'
    const replace = '_'
    formID = formID.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
  } else {
    let message = `ERROR: formId is null for response: ${JSON.stringify(doc)}`;
    log.error(message)
    throw new Error(message)
  }

// append geoIP to the data object
  if (geoIp) {
    for (const key in geoIp) {
      if (geoIp.hasOwnProperty(key)) {
        const value = geoIp[key]
        data[`geoip_${key}`] = value
      }
    }
  }

  if (!data['_id']) {
    data['_id'] = id
  }
  if (!data['caseid']) {
    data['caseId'] = caseId
  }
  if (!data['eventid']) {
    data['eventid'] = eventId
  }
  if (!data['eventformid']) {
    data['eventformid'] = eventFormId
  }
  if (!data['caseeventid']) {
    data['caseeventid'] = caseEventId
  }
  if (!data['startdatetime']) {
    data['startdatetime'] = startDatetime
  }
  // adding formID to the data object
  if (!data['formID_sanitized']) {
    data['formID_sanitized'] = formID
  }
  
  // Always overwrite data.participantid with doc.participantId
  data['participantid'] = participantId
  
  doc.ID = doc._id
  doc.dbRevision = doc._rev


  // # Delete the following keys;
  const valuesToRemove = ['_id', '_rev','buildChannel','buildId','caseEventId','deviceId','eventFormId','eventId','groupId','participantId','startDatetime', 'startUnixtime', 'tangerineModifiedOn', 'tangerineModifiedByUserId']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function convert_issue(knex, doc, groupId, tableName) {
  let data = doc.data
  if (!data) {
    data = {}
  }

  const id= doc._id
  const startDatetime = doc.startDatetime
  const geoIp = doc.geoip
  const caseId = doc.caseId
  const eventId = doc.eventId
  const eventFormId=  doc.eventFormId
  const participantId = doc.participantId
  const caseEventId = doc.caseEventId
  const formID = 'issue'
  
// append geoIP to the data object
  if (geoIp) {
    for (const key in geoIp) {
      if (geoIp.hasOwnProperty(key)) {
        const value = geoIp[key]
        data[`geoip_${key}`] = value
      }
    }
  }

  if (!data['_id']) {
    data['_id'] = id
  }
  if (!data['caseid']) {
    data['caseId'] = caseId
  }
  if (!data['eventid']) {
    data['eventid'] = eventId
  }
  if (!data['eventformid']) {
    data['eventformid'] = eventFormId
  }
  if (!data['caseeventid']) {
    data['caseeventid'] = caseEventId
  }
  if (!data['startdatetime']) {
    data['startdatetime'] = startDatetime
  }
  // adding formID to the data object
  if (!data['formID_sanitized']) {
    data['formID_sanitized'] = formID
  }
  
  // Always overwrite data.participantid with doc.participantId
  data['participantid'] = participantId
  
  doc.ID = doc._id
  doc.dbRevision = doc._rev

  // # Delete the following keys;
  const valuesToRemove = ['_id', '_rev','buildChannel','buildId','caseEventId','deviceId','eventFormId','eventId','groupId','participantId','startDatetime', 'startUnixtime']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function saveToMysql(knex, sourceDb, doc, tablenameSuffix, tableName, docType, primaryKey, createFunction) {
  let data;
  let result = {id: doc._id, tableName, docType, caseId: doc.caseId}
  const tables = []
  const groupId = doc.groupId || sourceDb.name
  // console.log("doc.type.toLowerCase(): " + doc.type.toLowerCase() + " for tableName: " + tableName + " groupId: " + groupId)
  if (!groupId) {
    log.error("Unable to save a doc without groupId: " + JSON.stringify(doc))
  } else {
    // Docs of type response must be flattened first to get the table name.
    if (doc.type.toLowerCase() !== 'response') {
      try {
        await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
      } catch (e) {
        let message = "Error creating table: " + e;
        log.error(message)
        throw new Error(message)
      }
    }
    switch (doc.type.toLowerCase()) {
      case 'case':
        data = await convert_case(knex, doc, groupId, tableName)
        break;
      case 'participant':
        data = await convert_participant(knex, doc, groupId, tableName)
        break;
      case 'case-event':
        data = await convert_case_event(knex, doc, groupId, tableName)
        break;
      case 'event-form':
        data = await convert_event_form(knex, doc, groupId, tableName)
        break;
      case 'issue':
        data = await convert_issue(knex, doc, groupId, tableName)
        break;
      case 'response':
      case 'attendance':
      case 'behavior':
      case 'scores':
        data = await convert_response(knex, doc, groupId, tableName)
        // Check if table exists and create if needed:
        tableName = data['formID_sanitized'] + tablenameSuffix
        result.tableName = tableName
        // log.info(`Checking tableName: ${tableName}`)
        if (!tables.includes(tableName)) {
          tables.push(tableName)
          await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
        }
        break;
      default:
        let message1 = "No case for this type: " + doc.type;
        log.error(message1)
        throw new Error(message1)
    }
    try {
      await insertDocument(groupId, knex, tableName, data, primaryKey);
    } catch (e) {
      let message2 = `Error inserting document: ${JSON.stringify(e)}`;
      log.error(message2)
      throw new Error(message2)
    }
  }
  // log.info('Finished processing: ' + data._id + " type: " + tableName)
  return result
}

/**
 * Checks if tableName exists in information_schema and creates it if needed.
 * @param knex
 * @param groupId
 * @param tableName
 * @param docType
 * @param createFunction
 * @param primaryKey
 * @returns {Promise<void>}
 */
async function createTable(knex, groupId, tableName, docType, createFunction, primaryKey) {
  const mysqlTableName = groupId.replace(/-/g, '');
  const results = await knex.raw('SELECT COUNT(*) AS CNT \n' +
    'FROM information_schema.tables\n' +
    'WHERE table_schema = ? \n' +
    '    AND table_name = ? \n' +
    'LIMIT 1;', [mysqlTableName, tableName])
  const values = results[0][0]
  const cnt = values['CNT']
  let tableExists = false
  if (cnt === 1) {
    tableExists = true;
  }
  // log.info("tableExists: " + tableExists)
  if (!tableExists) {
    log.info(`Table ${tableName} does not exist. Creating...`)
    try {
      const results = await knex.schema.createTable(groupId.replace(/-/g, '') + '.' + tableName, createFunction);
      log.info("Table create results: " + JSON.stringify(results))
    } catch (e) {
      let message = `Error creating table ${tableName} Error: ${e}`;
      log.error(message)
      throw new Error(message)
    }
  }
}

async function getColumns(knex, tableName, mysqlDbName) {
  let infoOriginal = []
  const results = await knex.raw('SHOW COLUMNS IN ' + tableName + ' FROM ' + mysqlDbName)
  // const values = results[0][0]
  if (results) {
    const fieldsArray = results[0]
    // console.log('fieldsArray: ' + JSON.stringify(fieldsArray))
    infoOriginal = fieldsArray.reduce((acc, item) => {
      acc[item.Field] = item
      return acc
    }, {})
  }
  return infoOriginal;
}

async function insertDocument(groupId, knex, tableName, data, primaryKey) {
  let newRecord = false

  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let schemaUpdated = false;
  const mysqlDbName = groupId.replace(/-/g, '')
  let infoOriginal = await getColumns(knex, tableName, mysqlDbName);
  const infoKeys = Object.keys(infoOriginal)
  const infoKeysLower = infoKeys.map(e => e.toLowerCase())
  // log.info(`infoKeys: ${JSON.stringify(infoKeysLower)}`)
  const dataKeys = Object.keys(data)
  for (let i = 0; i < dataKeys.length; i++) {
    const e = dataKeys[i]
    // const e = sanitize(dataKeys[i])
    // const oldKeyName = dataKeys[i]
    // const e = SqlString.escapeId(dataKeys[i], true)
    // dataKeys[i] = e
    if (!infoKeysLower.includes(e.toLowerCase())) {
      // log.debug(`Adding new column ${e} to table ${tableName}`)
      try {
        await knex.schema.withSchema(groupId.replace(/-/g, '')).alterTable(tableName, function (t) {
          t.text(e)
        })
        schemaUpdated = true
      } catch (e) {
        if (e.code && e.code === 'ER_DUP_FIELDNAME') {
          log.error(`Column ${e} already exists in table ${tableName}`)
        } else {
          log.error(e)
          throw new Error(e)
        }
      }
    }
  }
  // Now insert the data
  try {
    log.info("Inserting the data - or upserting - to " + tableName + "  for id: " + data[primaryKey] + " groupId: " + groupId)
    // log.info("Inserting the data - or upserting - to " + tableName + "  for id: " + data[primaryKey] + " primaryKey: " + primaryKey + " data: " + JSON.stringify(data))
    const mysqlDbName = groupId.replace(/-/g, '')
    await knex(mysqlDbName + '.' + tableName).insert(data).onConflict(primaryKey).merge()
  } catch (e) {
    if (e.code && e.code === 'ER_DUP_ENTRY') {
      log.error(`Duplicate record for participantID ${participantId}`)
    } else {
      log.error(e)
      throw new Error(`Error inserting/upserting doc to ${tableName} for id: ${data[primaryKey]}`, e)
    }
  }
  if (schemaUpdated) {
    log.info(`Schema updated for table ${tableName}`)
    log.info(`Original keys: ${JSON.stringify(infoKeys)}`)
    const infoUpdated = await getColumns(knex, tableName, mysqlDbName);
    const infoUpdatedKeys = Object.keys(infoUpdated)
    log.info(`Updated keys: ${JSON.stringify(infoUpdatedKeys)}`)
    // log.info(`data: ${JSON.stringify(data)}`)
  }
}