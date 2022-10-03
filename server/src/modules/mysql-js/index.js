const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const fs = require('fs-extra');
const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { spawn } = require('child_process');
const fsCore = require('fs');
const readFile = util.promisify(fsCore.readFile);
const createGroupDatabase = require('../../create-group-database.js')
const { v4: uuidv4 } = require('uuid');
const byParticipantView = require(`./byParticipant.js`)
const byTypeViews = require(`./byType.js`)
const sanitize = require("sanitize-filename");

/* Enable this if you want to run commands manually when debugging.
const exec = async function(cmd) {
  console.log(cmd) 
}
*/

async function insertGroupReportingViews(groupName) {
  let groupDb = new DB(`${groupName}-mysql`)
  let designDoc = Object.assign({}, byParticipantView)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`byParticipant View inserted into ${groupName}-mysql`)
  } catch (error) {
    log.error(error)
  }
  designDoc = Object.assign({}, byTypeViews)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`byType View inserted into ${groupName}-mysql`)
  } catch (error) {
    log.error(error)
  }

  // sanitized
  groupDb = new DB(`${groupName}-mysql-sanitized`)
  designDoc = Object.assign({}, byParticipantView)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`byParticipant View inserted into ${groupName}-mysql-sanitized`)
  } catch (error) {
    log.error(error)
  }
  designDoc = Object.assign({}, byTypeViews)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`byType View inserted into ${groupName}-mysql-sanitized`)
  } catch (error) {
    log.error(error)
  }
}

module.exports = {
  name: 'mysql-js',
  connection: null,
  hooks: {
    boot: async function(data) {
      const groups = await groupsList()
      for (groupId of groups) {

        const pathToStateFile = `/mysql-module-state/${groupId}.ini`
        // startTangerineToMySQL(pathToStateFile)
      }
      return data
    },
    enable: async function() {
      const groups = await groupsList()
      for (groupId of groups) {
        await initializeGroupForMySQL(groupId)
        await createGroupDatabase(groupId, '-mysql')
        await createGroupDatabase(groupId, '-mysql-sanitized')
        // MySQL T_MYSQL_CONTAINER_NAME
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
          await knex.raw('CREATE DATABASE ' + groupId.replace(/-/g, ''))
        } catch (e) {
          log.debug(e)
        }
        await knex.destroy()
      }
    },
    disable: function(data) {

    },
    groupNew: async function(data) {
      const {groupName} = data
      const groupId = groupName
      await initializeGroupForMySQL(groupId)
      const pathToStateFile = `/mysql-module-state/${groupId}.ini`
      // startTangerineToMySQL(pathToStateFile)
      await createGroupDatabase(groupName, '-mysql')
      await createGroupDatabase(groupName, '-mysql-sanitized')
      await insertGroupReportingViews(groupName)
      return data
    },
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        await removeGroupForMySQL(groupName)
        await initializeGroupForMySQL(groupName)
        console.log(`removing db ${groupName}-mysql`)
        let db = new DB(`${groupName}-mysql`)
        await db.destroy()
        await createGroupDatabase(groupName, '-mysql')
        db = new DB(`${groupName}-mysql-sanitized`)
        await db.destroy()
        await createGroupDatabase(groupName, '-mysql-sanitized')
        await insertGroupReportingViews(groupName)
      }
      return data
    },
    reportingOutputs: async function(data) {
      async function addDocument(sourceDb, targetDb, doc, locationList, sanitized, exclusions) {
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
            const uploadedDoc = await saveFlatResponse(doc, locationList, targetDb, sanitized);
            log.info("Saving case_instance to MySQL" + doc._id)
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
            const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
            
            // output participants
            for (const participant of doc.participants) {
              let participant_id = participant.id
              if (process.env.T_MYSQL_MULTI_PARTICIPANT_SCHEMA) {
                participant_id = doc._id + '-' + participant.id
              }
              const uploadedDoc = await pushResponseToCouchdb({
                ...participant,
                _id: participant_id,
                caseId: doc._id,
                participantId: participant.id,
                type: "participant",
                groupId: doc.groupId,
                archived: doc.archived||''
              }, targetDb);

              tableName = 'participant' + tablenameSuffix
              docType = 'participant'
              primaryKey = 'participantID'
              createFunction = function (t) {
                t.engine('InnoDB')
                t.string(primaryKey, 36).notNullable().primary();
                t.string('CaseID', 36).index('participant_CaseID_IDX');
                t.double('inactive');
              }
              const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
              log.info('Processed: ' + JSON.stringify(result))
            }
          
            for (const event of doc.events) {
              // output event-forms
              if (event['eventForms']) {
                for (const eventForm of event['eventForms']) {
                  // for (let index = 0; index < event['eventForms'].length; index++) {
                  // const eventForm = event['eventForms'][index]
                  let uploadedDoc;
                  const eventFormDoc = {...eventForm, type: "event-form", _id: eventForm.id, groupId: doc.groupId, archived: doc.archived}
                  try {
                    uploadedDoc = await pushResponseToCouchdb(eventFormDoc, targetDb);
                  } catch (e) {
                    if (e.status !== 404) {
                      console.log("Error processing eventForm: " + JSON.stringify(e) + " e: " + e)
                    }
                  }
                  // log.info("uploadedDoc eventForm: " + JSON.stringify(uploadedDoc))
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
                  const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
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
              const uploadedDoc = await pushResponseToCouchdb(caseEventDoc, targetDb)
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
              const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
              log.info('Processed: ' + JSON.stringify(result))
            }
          } else if (doc.type === 'issue') {
            const uploadedDoc = await saveFlatResponse(doc, locationList, targetDb, sanitized);
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
            const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
          } else {
            const uploadedDoc = await saveFlatResponse(doc, locationList, targetDb, sanitized);
            tableName = null;
            docType = 'response';
            primaryKey = 'ID'
            createFunction = function (t) {
              t.engine('InnoDB')
              t.string(primaryKey, 36).notNullable().primary();
              t.string('caseId', 36) // .index('response_caseId_IDX');
              t.string('participantID', 36) //.index('case_instances_ParticipantID_IDX');
              t.string('caseEventId', 36) // .index('eventform_caseEventId_IDX');
              t.tinyint('complete');
              t.string('archived', 36); // TODO: "sqlMessage":"Incorrect integer value: '' for column 'archived' at row 1
            }
            const result = await saveToMysql(knex, uploadedDoc, tablenameSuffix, tableName, docType, primaryKey, createFunction)
            log.info('Processed: ' + JSON.stringify(result))
          }
          await knex.destroy()
        }
      }
        
      const {doc, sourceDb} = data
      const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
      // const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
      const groupsDb = await new DB(`groups`);
      const groupDoc = await groupsDb.get(`${sourceDb.name}`)
      const exclusions = groupDoc['exclusions']
      // First generate the full-cream database
      let mysqlDb
      try {
        mysqlDb = await new DB(`${sourceDb.name}-mysql`);
      } catch (e) {
        console.log("Error creating db: " + JSON.stringify(e))
      }
      let sanitized = false;
      await addDocument(sourceDb, mysqlDb, doc, locationList, sanitized, exclusions);
      
      // Then create the sanitized version
      let mysqlSanitizedDb
      try {
        mysqlSanitizedDb = await new DB(`${sourceDb.name}-mysql-sanitized`);
      } catch (e) {
        console.log("Error creating db: " + JSON.stringify(e))
      }
      sanitized = true;
      await addDocument(sourceDb, mysqlSanitizedDb, doc, locationList, sanitized, exclusions)
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
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  await fs.unlink(pathToStateFile)
  console.log(`Removed state file and database for ${groupId}`)
 
}

async function initializeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  console.log(`Creating mysql db ${mysqlDbName}`)
  try {
    await exec(`mysql -u ${process.env.T_MYSQL_USER} -h ${process.env.T_MYSQL_CONTAINER_NAME} -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
  } catch (e) {
    console.log(`Error creating mysql db ${mysqlDbName}`)
    console.log(e)
  }
  console.log(`Created mysql db ${mysqlDbName}`)
  console.log('Creating tangerine to mysql state file...')
  const state = `[TANGERINE]
DatabaseURL = http://couchdb:5984/
DatabaseName = ${groupId}-mysql
DatabaseUserName = ${process.env.T_COUCHDB_USER_ADMIN_NAME} 
DatabasePassword = ${process.env.T_COUCHDB_USER_ADMIN_PASS} 
LastSequence = 0

[MySQL]
HostName = mysql 
DatabaseName = ${mysqlDbName} 
UserName = ${process.env.T_MYSQL_USER} 
Password = ${process.env.T_MYSQL_PASSWORD} 
  `
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  await fs.writeFile(pathToStateFile, state)
  console.log('Created tangerine to mysql state file.')
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
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 * @param {boolean} sanitized - flag if data must filter data based on the identifier flag.
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, locationList, sanitized) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    formTitle: formResponse.form.title,
    startUnixtime: formResponse.startUnixtime,
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete,
    archived: formResponse.archived||''
  };
  function set(input, key, value) {
    flatFormResponse[key.trim()] = input.skipped
      ? process.env.T_REPORTING_MARK_SKIPPED_WITH
      : input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
        ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH 
        : value
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
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.level}`, group.value)
          locationKeys.push(group.value)
          try {
            const location = getLocationByKeys(locationKeys, locationList)
            for (let keyName in location) {
              if (keyName !== 'children') {
                set(input, `${firstIdSegment}${input.name}.${group.level}_${keyName}`, location[keyName])
              }
            }
          } catch(e) {
            set(input, `${firstIdSegment}${input.name}.${group.level}_label`, 'orphaned')
          }
        }
      } else if (input.tagName === 'TANGY-RADIO-BUTTONS' && Array.isArray(input.value)) {
        let selectedOption = input.value.find(option => !!option.value) 
        set(input, `${firstIdSegment}${input.name}`, selectedOption ? selectedOption.name : '')
      } else if (input.tagName === 'TANGY-PHOTO-CAPTURE') {
        set(input, `${firstIdSegment}${input.name}`, input.value ? 'true' : 'false')
      } else if (input.tagName === 'TANGY-VIDEO-CAPTURE') {
        set(input, `${firstIdSegment}${input.name}`, input.value ? 'true' : 'false')
      } else if (input && typeof input.value === 'string') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && typeof input.value === 'number') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.name}`, group.value)
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          set(input, `${firstIdSegment}${input.name}.${key}`, input.value[key])
        };
      }
      } // sanitize
    }
  }
  return flatFormResponse;
};

function pushResponseToCouchdb(doc, db) {
  return new Promise((resolve, reject) => {
    // If there are any objects/arrays in the flatResponse, stringify them. Also make all property names lowercase to avoid duplicate column names (example: ID and id are different in python/js, but the same for MySQL leading attempting to create duplicate column names of id and ID).
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
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(updatedDoc))
          .catch(error => reject(`mysql pushResponseToCouchdb could not overwrite ${doc._id} to ${db.name} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        const docClone = Object.assign({}, doc);
        // Make a clone of the doc so we can delete part of it but not lose it in other iterations of this code
        // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
        // delete the _rev property from the docClone
        delete docClone._rev
        db.put(docClone)
          .then(_ => resolve(docClone))
          .catch(error => reject(`mysql pushResponseToCouchdb could not save ${docClone._id} to ${docClone.name} because Error of ${JSON.stringify(error)}`))
    });
  })
}

async function saveFlatResponse(doc, locationList, targetDb, sanitized) {
  let flatResponse = await generateFlatResponse(doc, locationList, sanitized);
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
  const uploadedDoc = await pushResponseToCouchdb({
    ...topDoc,
    data: flatResponse
  }, targetDb);
  return uploadedDoc
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

  let formID = data['formid']
  if (formID) {
    // thanks to https://stackoverflow.com/a/14822579
    const find = '-'
    const replace = '_'
    formID = formID.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
  } else {
    log.error(`ERROR: formID is null for response: ${JSON.stringify(doc)}`)
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
  if (!data['participantid']) {
    data['participantid'] = participantId
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

  doc.ID = doc._id
  doc.dbRevision = doc._rev

  // # Delete the following keys;
  const valuesToRemove = ['_id', '_rev','buildChannel','buildId','caseEventId','deviceId','eventFormId','eventId','groupId','participantId','startDatetime', 'startUnixtime']
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
  if (!data['participantid']) {
    data['participantid'] = participantId
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

  doc.ID = doc._id
  doc.dbRevision = doc._rev

  // # Delete the following keys;
  const valuesToRemove = ['_id', '_rev','buildChannel','buildId','caseEventId','deviceId','eventFormId','eventId','groupId','participantId','startDatetime', 'startUnixtime']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function saveToMysql(knex, doc, tablenameSuffix, tableName, docType, primaryKey, createFunction) {
  let data;
  let result = {id: doc._id, tableName, docType}
  const tables = []
  const groupId = doc.groupId
  console.log("doc.type.toLowerCase(): " + doc.type.toLowerCase() + " for tableName: " + tableName + " groupId: " + groupId)
  if (!groupId) {
    log.info("doc without groupId: " + JSON.stringify(doc))
  }
  // Docs of type response must be flattened first to get the table name.
  if (doc.type.toLowerCase() !== 'response') {
    try {
      await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
    } catch (e) {
      log.error("Error creating table: " + e)
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
      log.error("No case for this type: " + doc.type)
  }
  try {
    await insertDocument(groupId, knex, tableName, data, primaryKey);
  } catch (e) {
    log.error(`Error inserting document: ${JSON.stringify(e)}`)
  }
  log.info('Finished processing: ' + tableName)
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
      log.error(`Error creating table ${tableName} Error: ${e}`)
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
      log.info(`Adding column ${e} new name: ${dataKeys[i]} to table ${tableName}`)
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
        }
      }
    }
  }
  // Now insert the data
  try {
    log.info("Inserting the data - or upserting - to " + tableName + "  for id: " + data[primaryKey])
    // log.info("Inserting the data - or upserting - to " + tableName + "  for id: " + data[primaryKey] + " primaryKey: " + primaryKey + " data: " + JSON.stringify(data))
    const mysqlDbName = groupId.replace(/-/g, '')
    await knex(mysqlDbName + '.' + tableName).insert(data).onConflict(primaryKey).merge()
  } catch (e) {
    if (e.code && e.code === 'ER_DUP_ENTRY') {
      log.error(`Duplicate record for participantID ${participantId}`)
    } else {
      log.error(e)
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