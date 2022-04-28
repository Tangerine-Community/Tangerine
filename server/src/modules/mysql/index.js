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
const groupReportingViews = require(`./views.js`)
const sanitize = require("sanitize-filename");
const mysql = require('mysql2/promise');
const knex = require('knex');

/* Enable this if you want to run commands manually when debugging.
const exec = async function(cmd) {
  console.log(cmd)
}
*/

async function insertGroupReportingViews(groupName) {
  let designDoc = Object.assign({}, groupReportingViews)
  let groupDb = new DB(`${groupName}-mysql`)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`group reporting views inserted into ${groupName}-reporting`)
  } catch (error) {
    log.error(error)
  }

  // sanitized
  groupDb = new DB(`${groupName}-mysql-sanitized`)
  try {
    let status = await groupDb.post(designDoc)
    log.info(`group reporting views inserted into ${groupName}-reporting-sanitized`)
  } catch (error) {
    log.error(error)
  }
}

module.exports = {
  name: 'mysql',
  // inject: async (key, value, config) => {
  //   this.injected[key] = value
  //   // console.log("Injected", this.injected.connection)
  // },
  // injected: {},
  hooks: {
    foo: "bar",
    reportingWorkerBatchStart: async function(workerState, inject, injected) {
      // console.log('mysql-js reportingWorkerBatchStart creating a mysql connection. ' + JSON.stringify(workerState))
      // TODO: Make this a connection pool.
      // console.log('mysql-js reportingWorkerBatch ', injected.foo)
      // console.log('mysql-js reportingWorkerBatch ',workerState)
      // if (injected.connection) {
      // const mysqlDbName = sourceDb.name.replace(/-/g,'')
      // create the connection to database

      let connection
      try {
        let hostname = process.env.T_MYSQL_CONTAINER_NAME
        let username = process.env.T_MYSQL_USER
        let password = process.env.T_MYSQL_PASSWORD
        // connection = await mysql.createConnection({host: hostname, user: username, password: password, database: mysqlDbName});
        // connection = await mysql.createConnection({host: hostname, user: username, password: password});
        connection = await knex({
          client: 'mysql2',
          connection: {
            host: 'mysql',
            port: 3306,
            user: 'root',
            password: `${process.env.T_MYSQL_PASSWORD}`
          }
        });
        // console.log("connection.workerState: " + JSON.stringify(connection.workerState))
        // const [rows, fields] = await connection.query('show databases');
        // log.info(`rows: ${JSON.stringify(rows)}`)
      } catch (e) {
        log.error(e)
      }
      if (connection) {
        inject('connection', connection, workerState)
        inject('foo', 'bar', workerState)
        console.log("injected connection in reportingWorkerBatch hook in mysql module")
      }
      // inject('foo', true)
      // }
    },
    reportingWorkerBatchEnd: async function (workerState, inject, injected) {
      console.log('mysql reportingWorkerBatchEnd ',injected.foo)
      // console.log('mysql-js reportingWorkerBatchEnd ')
      if (injected.connection) {
        injected.foo = "WHOA!"
        // await injected.connection.end((err) => {
        await injected.connection.destroy((err) => {
          log.info("Ending mysql connection.")
          // The connection is terminated now
          if (err) {
            log.error(err)
          }
        });
      }
      // console.log('mysql-js reportingWorkerBatchEnd ',injected.foo)
    },
    boot: async function (data) {
      const groups = await groupsList()
      for (groupId of groups) {
        const pathToStateFile = `/mysql-module-state/${groupId}.ini`
        // startTangerineToMySQL(pathToStateFile)
        // await this.reportingWorkerBatchStart(pathToStateFile)
      }
      return data
    },
    enable: async function () {
      const groups = await groupsList()
      for (groupId of groups) {
        await initializeGroupForMySQL(groupId)
        await createGroupDatabase(groupId, '-mysql')
        await createGroupDatabase(groupId, '-mysql-sanitized')
      }
    },
    disable: function (data) {

    },
    groupNew: async function (data) {
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
    clearReportingCache: async function (data) {
      const {groupNames} = data
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
    reportingOutputs: async function (data) {
      let connection;
      const {doc, sourceDb, sequence, reportingConfig, injected} = data
      console.log("reportingOutputs hook in mysql module", injected.foo)
      if (injected.connection) {
        connection = injected.connection
        // const {doc, sourceDb, sequence, reportingConfig} = data
        const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
        // const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
        const groupsDb = await new DB(`groups`);
        const groupDoc = await groupsDb.get(`${sourceDb.name}`)
        const exclusions = groupDoc['exclusions']
        let tablenameSuffix = groupDoc['tablenameSuffix']
        if (!tablenameSuffix) {
          tablenameSuffix = ''
        }
        let mysqlDb = connection
        let sanitized = false;
        log.info(`Just got knex for ${sourceDb.name}`)

        try {
          await transformDocument(sourceDb, mysqlDb, doc, locationList, sanitized, exclusions, tablenameSuffix);
        } catch (e) {
          log.error(e)
          throw new Error(e)
        }
        log.info(`TODO: Create sanitized ${sourceDb.name}`)
        // log.info(`now sanitized ${sourceDb.name}`)
        //
        // // Then create the sanitized version
        // let mysqlSanitizedDb
        // try {
        //   mysqlSanitizedDb = await new DB(`${sourceDb.name}-mysql-sanitized`);
        // } catch (e) {
        //   console.log("Error creating db: " + JSON.stringify(e))
        // }
        // sanitized = true;
        // await transformDocument(sourceDb, mysqlSanitizedDb, doc, locationList, sanitized, exclusions, tablenameSuffix);
        return data
      }
    }
  }
}

async function removeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP DATABASE ${mysqlDbName};"`)
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  await fs.unlink(pathToStateFile)
  console.log(`Removed state file and database for ${groupId}`)
 
}

async function initializeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  console.log(`Creating mysql db ${mysqlDbName}`)
  try {
    await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
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

async function startTangerineToMySQL(pathToStateFile) {
  try {
    const cmd = `python3 /tangerine/server/src/modules/mysql/TangerineToMySQL.py ${pathToStateFile}`
    const script = spawn(`python3`, ['/tangerine/server/src/modules/mysql/TangerineToMySQL.py', pathToStateFile],{ env: { ...process.env, PYTHONIOENCODING: 'utf8' } })
    script.stdout.on('data', (data) => {
      log.info(`${cmd} -- ${data}`)
    })
    script.stderr.on('data', (data) => {
      log.error(`${cmd} -- ${data}`)
    });
    script.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    log.info(`Running: ${cmd}`)
  } catch(e) {
    console.error(e)
  }
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

const generateFlatResponse = function (formResponse, locationList, sanitized) {
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

async function pushResponse(doc, targetDb, tablenameSuffix) {
  return new Promise(async (resolve, reject) => {
    let tableName, docType, createFunction, primaryKey, data;
    const groupId = doc.groupId
    if (doc.type === 'participant') {
      log.info(`Pushing participant ${doc._id} to MySQL. ${JSON.stringify(doc)}`)
      tableName = 'participant' + tablenameSuffix
      docType = 'participant'
      primaryKey = 'participantID'
      createFunction = function (t) {
        t.engine('InnoDB')
        t.string(primaryKey, 36).notNullable().primary();
        t.string('CaseID', 36).index('participant_CaseID_IDX');
        t.double('inactive');
      }
      try {
        await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
        data = await convert_participant(targetDb, doc, groupId, tableName)
        await insertDocument(groupId, targetDb, tableName, data, primaryKey);
      } catch (e) {
        log.error(`Error converting ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(e)}`)
        return reject(e)
      }
    } else if (doc.type === 'case') {
      log.info(`Pushing ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(doc)}`)
      tableName = 'case_instances' + tablenameSuffix
      docType = 'case'
      primaryKey = 'CaseID'
      createFunction = function (t) {
        t.engine('InnoDB')
        t.string(primaryKey, 36).notNullable().primary();
        t.integer('complete');
        t.bigint('startunixtime');//TODO: is this being set properly in mysql?
      }
      try {
        await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
        data = await convert_case(targetDb, doc, groupId, tableName)
        await insertDocument(groupId, targetDb, tableName, data, primaryKey);
      } catch (e) {
        log.error(`Error converting ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(e)}`)
        return reject(e)
      }
    } else if (doc.type === 'case-event') {
      log.info(`Pushing ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(doc)}`)
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
      try {
        await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
        data = await convert_case_event(targetDb, doc, groupId, tableName)
        await insertDocument(groupId, targetDb, tableName, data, primaryKey);
      } catch (e) {
        log.error(`Error converting ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(e)}`)
        return reject(e)
      }
    } else if (doc.type === 'event-form') {
      log.info(`Pushing ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(doc)}`)
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
      try {
        await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
        data = await convert_event_form(targetDb, doc, groupId, tableName)
        await insertDocument(groupId, targetDb, tableName, data, primaryKey);
      } catch (e) {
        log.error(`Error converting ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(e)}`)
        return reject(e)
      }
    } else if (doc.type === 'response') {
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
      data = await convert_response(targetDb, doc, groupId, tableName)
      tableName = data['formID_sanitized'] + tablenameSuffix
      log.info(`Checking tableName: ${tableName}`)
      try {
        await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
        await insertDocument(groupId, targetDb, tableName, data, primaryKey);
      } catch (e) {
        log.debug(`Error creating table ${tableName} for ${doc.type} ${doc._id} to MySQL. Probably already exists. ${JSON.stringify(e)}`)
        if (e.code === 'ER_TABLE_EXISTS_ERROR') {
          log.debug(`Table ${tableName} already exists.`)
        } else {
          log.error(`Error creating table ${tableName} for ${doc.type} ${doc._id} to MySQL. ${JSON.stringify(e)}`)
          return reject(e)
        }
      }
    } else {
      return resolve(true)
    }
  })
}

async function transformDocument(sourceDb, targetDb, doc, locationList, sanitized, exclusions, tablenameSuffix) {
  log.info(`generateDatabase `)
  if (exclusions && exclusions.includes(doc.form.id)) {
    // skip!
    log.info(`exclusions `)
  } else {
    log.info(`Checking if we can process ${doc._id} ${doc.type}`)
    if (doc.type === 'case') {
      // output case
      // log.info(`saveFlatResponse for ${doc.type}: ${JSON.stringify(doc)}`)
      try {
        const flatCase = flattenResponse(doc, locationList, targetDb, sanitized, tablenameSuffix);
        // log.info(`flatCase for ${doc.type}: ${JSON.stringify(flatCase)}`)
        await pushResponse(flatCase, targetDb, tablenameSuffix);
      } catch (e) {
        log.error(`error in saving case doc for ${doc._id} ${doc.type}`, e)
        throw new Error(e)
      }

      // output participants
      for (const participant of doc.participants) {
        let participant_id = participant.id
        if (process.env.T_MYSQL_MULTI_PARTICIPANT_SCHEMA) {
          participant_id = doc._id + '-' + participant.id
        }
        log.info(`saveFlatResponse for  participant`)
        const participantDoc = {
          ...participant,
          _id: participant_id,
          caseId: doc._id,
          groupId: doc.groupId,
          participantId: participant.id,
          type: "participant",
          archived: doc.archived || ''
        }
        const dataObject = stringifyObjectsAndLowercaseColumns(participantDoc);
        await pushResponse(dataObject, targetDb, tablenameSuffix);
      }

      // output case-events
      for (const event of doc.events) {
        // output event-forms
        if (event['eventForms']) {
          for (const eventForm of event['eventForms']) {
            // for (let index = 0; index < event['eventForms'].length; index++) {
            // const eventForm = event['eventForms'][index]
            try {
              await pushResponse({
                ...eventForm,
                type: "event-form",
                _id: eventForm.id,
                archived: doc.archived
              }, targetDb, tablenameSuffix);
            } catch (e) {
              if (e.status !== 404) {
                console.log("Error processing eventForm: " + JSON.stringify(e) + " e: " + e)
              }
            }
          }
        } else {
          console.log("Mysql - NO eventForms! doc _id: " + doc._id + " in database " + sourceDb.name + " event: " + JSON.stringify(event))
        }
        // Make a clone of the event so we can delete part of it but not lose it in other iterations of this code
        // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
        const eventClone = Object.assign({}, event);
        // Delete the eventForms array from the case-event object - we don't want this duplicate structure 
        // since we are already serializing each event-form and have the parent caseEventId on each one.
        delete eventClone.eventForms
        await pushResponse({
          ...eventClone,
          _id: eventClone.id,
          type: "case-event",
          archived: doc.archived
        }, targetDb, tablenameSuffix)
      }
    } else {
      const responseDoc = flattenResponse(doc, locationList, targetDb, sanitized, tablenameSuffix);
      await pushResponse(responseDoc, targetDb, tablenameSuffix);
    }
  }
}

/**
 * If there are any objects/arrays in the flatResponse, stringify them. 
 * Also make all property names lowercase to avoid duplicate column names 
 * (example: ID and id are different in python/js, but the same for MySQL leading attempting to create duplicate column names of id and ID).
 * @param data
 * @returns {{[p: string]: *}}
 */
function stringifyObjectsAndLowercaseColumns(data) {
  return Object.keys(data).reduce((acc, key) => {
    return {
      ...acc,
      ...key === ''
        ? {}
        : {
          [key.toLowerCase()]: typeof data[key] === 'object'
            ? JSON.stringify(data[key])
            : data[key]
        }
    }
  }, {})
}

function flattenResponse(doc, locationList, targetDb, sanitized, tablenameSuffix) {
  const flatResponse = generateFlatResponse(doc, locationList, sanitized);
  const dataObject = stringifyObjectsAndLowercaseColumns(flatResponse);
  // make sure the top-level properties of doc are copied.
  const topDoc = {}
  Object.entries(doc).forEach(([key, value]) => value === Object(value) ? null : topDoc[key] = value);
  // try {
  //   await pushResponse({...topDoc, data: dataObject}, targetDb), tablenameSuffix;
  // } catch (e) {
  //   log.error(`Error saving flat response: ${JSON.stringify(e)}`)
  //   throw new Error(e)
  // }
  // if (doc.data && typeof doc.data === 'object') {
  //   doc.data = stringifyObjectsAndLowercaseColumns(doc);
  // }
  return {...topDoc, data: dataObject}
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
 * Queries the server for list of documents to process and insert.
 * Forms of type 'response' use "dynamic" table names based upon doc.formId.
 * If the form is type 'response' then it will create the table if needed.
 * @param groupId
 * @param docType
 * @param targetDb
 * @param pathToStateFile
 * @param tableName
 * @param primaryKey
 * @param createFunction
 * @returns {Promise<void>}
 */
async function queryAndConvertDocuments(groupId, docType, targetDb, tableName, primaryKey, createFunction, tablenameSuffix) {
  // Do a query, alter table, and insert data.
  const reportingDb = DB(`${groupId}-mysql`)
  const tables = []
  try {
    // const docs = await reportingDb.query(viewName)
    const docs = await reportingDb.query('byType', {
      key: docType
    })
    log.info("db.rows.length: " + docs.rows.length)
    for (let i = 0; i < docs.rows.length; i++) {
      // log.info("Processing doc: " + i + " of " + allDocs.rows.length)
      const entry = docs.rows[i]
      const doc = await reportingDb.get(entry.id)
      // await generateMysqlRecord(targetDb, pathToStateFile, groupId, tableName, doc, primaryKey)
      const type = doc.type
      // log.info(`type: ${type}`)
      if (type) {
        let data;
        if (type === 'participant') {
          data = await convert_participant(targetDb, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'case') {
          data = await convert_case(targetDb, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'case-event') {
          data = await convert_case_event(targetDb, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'event-form') {
          data = await convert_event_form(targetDb, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'response') {
          // log.info(`Converting: ${doc._id}`)
          data = await convert_response(targetDb, doc, groupId, tableName)
          tableName = data['formID_sanitized'] + tablenameSuffix
          // log.info(`Checking tableName: ${tableName}`)
          if (!tables.includes(tableName)) {
            // now delete it. 
            await targetDb.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
            tables.push(tableName)
            await createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey)
          }
        }
        // log.info(`data to insert: ${JSON.stringify(data)}`)
        try {
          await insertDocument(groupId, targetDb, tableName, data, primaryKey);
        } catch (e) {
          log.error(`Error inserting document: ${JSON.stringify(e)}`)
        }
      }
    }
  } catch (err) {
    log.info("error: " + JSON.stringify(err))
  }
}

/**
 * Checks if tableName exists in information_schema and creates it if needed.
 * @param targetDb
 * @param groupId
 * @param tableName
 * @param docType
 * @param createFunction
 * @param primaryKey
 * @returns {Promise<void>}
 */
async function createTable(targetDb, groupId, tableName, docType, createFunction, primaryKey) {
  const mysqlTableName = groupId.replace(/-/g, '');
  const results = await targetDb.raw('SELECT COUNT(*) AS CNT \n' +
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
  log.info("tableName: " + tableName)
  if (!tableExists) {
    log.info(`Table ${tableName} does not exist. Creating...`)
    try {
      const results = await targetDb.schema.createTable(groupId.replace(/-/g, '') + '.' + tableName, createFunction);
      log.info("Table create results: " + JSON.stringify(results))
    } catch (e) {
      log.error(`Error creating table ${tableName} Error: ${e}`)
    }
  }
}

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

async function getColumns(targetDb, tableName, mysqlDbName) {
  let infoOriginal = []
  const results = await targetDb.schema.raw('SHOW COLUMNS IN ' + tableName + ' FROM ' + mysqlDbName)
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

async function insertDocument(groupId, targetDb, tableName, data, primaryKey) {
  let newRecord = false

  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let schemaUpdated = false, infoOriginal
  const mysqlDbName = groupId.replace(/-/g, '')
  try {
    infoOriginal = await getColumns(targetDb, tableName, mysqlDbName);
  } catch (e) {
    const error = `Error getting columns for table ${tableName} Error: ${e}`
    log.error(error)
    throw new Error(error)
  }
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
        await targetDb.schema.withSchema(groupId.replace(/-/g, '')).alterTable(tableName, function (t) {
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
    await targetDb(mysqlDbName + '.' + tableName).insert(data).onConflict(primaryKey).merge()
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
    const infoUpdated = await getColumns(targetDb, tableName, mysqlDbName);
    const infoUpdatedKeys = Object.keys(infoUpdated)
    log.info(`Updated keys: ${JSON.stringify(infoUpdatedKeys)}`)
    // log.info(`data: ${JSON.stringify(data)}`)
  }
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

async function convert_participant(targetDb, doc, groupId, tableName) {
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

async function convert_case(targetDb, doc, groupId, tableName) {
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
  return data
}

async function convert_case_event(targetDb, doc, groupId, tableName) {
  const data = {}
  doc.CaseEventID = doc._id
  doc.dbRevision = doc._rev
  // # Delete the following keys;
  const valuesToRemove = ['id', 'type','_id', '_rev']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function convert_event_form(targetDb, doc, groupId, tableName) {
  let data = doc.data
  if (!data) {
    data = {}
  }
  doc.EventFormID = doc._id
  doc.dbRevision = doc._rev
  // # Delete the following keys;
  const valuesToRemove = ['id', 'type','_id', '_rev']
  valuesToRemove.forEach(e => delete doc[e]);
  const cleanData = populateDataFromDocument(doc, data);
  return cleanData
}

async function convert_response(targetDb, doc, groupId, tableName) {
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