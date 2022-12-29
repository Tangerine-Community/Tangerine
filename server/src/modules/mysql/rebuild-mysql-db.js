const groupsList = require('../../groups-list.js')
const DB = require(`../../db.js`)
const {log} = require("tangy-log");
const util = require("util");
// const exec = util.promisify(require('child_process').exec)
const sanitize = require('sanitize-filename');
// const SqlString = require('sqlstring');
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

async function convert_case_event(knex, doc, groupId, tableName) {
  const data = {}
  doc.CaseEventID = doc._id
  doc.dbRevision = doc._rev
  // # Delete the following keys;
  const valuesToRemove = ['id', 'type','_id', '_rev']
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
  const valuesToRemove = ['id', 'type','_id', '_rev']
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

/**
 * Queries the server for list of documents to process and insert.
 * Forms of type 'response' use "dynamic" table names based upon doc.formId. 
 * If the form is type 'response' then it will create the table if needed. 
 * @param groupId
 * @param docType
 * @param knex
 * @param pathToStateFile
 * @param tableName
 * @param primaryKey
 * @param createFunction
 * @returns {Promise<void>}
 */
async function queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, createFunction, tablenameSuffix) {
  // Do a query, alter table, and insert data.
  const reportingDb = DB(`${groupId}-mysql`)
  const tables = []
  try {
    log.info("Querying byType for " + docType)
    // const docs = await reportingDb.query(viewName)
    const docs = await reportingDb.query('byType', {
      key: docType,
      stale: 'update_after'
    })
    log.info("db.rows.length: " + docs.rows.length)
    for (let i = 0; i < docs.rows.length; i++) {
      // log.info("Processing doc: " + i + " of " + allDocs.rows.length)
      const entry = docs.rows[i]
      const doc = await reportingDb.get(entry.id)
      // await generateMysqlRecord(knex, pathToStateFile, groupId, tableName, doc, primaryKey)
      const type = doc.type
      // log.info(`type: ${type}`)
      if (type) {
        let data;
        if (type === 'participant') {
          data = await convert_participant(knex, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'case') {
          data = await convert_case(knex, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'case-event') {
          data = await convert_case_event(knex, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'event-form') {
          data = await convert_event_form(knex, doc, groupId, tableName)
        } else if (type.toLowerCase() === 'response') {
          // log.info(`Converting: ${doc._id}`)
          data = await convert_response(knex, doc, groupId, tableName)
          tableName = data['formID_sanitized'] + tablenameSuffix
          // log.info(`Checking tableName: ${tableName}`)
          if (!tables.includes(tableName)) {
            // now delete it. 
            await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
            tables.push(tableName)
            await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
          }
        }
        // log.info(`data to insert: ${JSON.stringify(data)}`)
        try {
          await insertDocument(groupId, knex, tableName, data, primaryKey);
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

/**
 * T_ONLY_PROCESS_THESE_GROUPS
 * @returns {Promise<void>}
 */
async function rebuildMysqlDb(tablenameSuffix) {
  if (tablenameSuffix === undefined) {
    tablenameSuffix = ''
    log.info('Rebuilding Mysql db')
  } else {
    log.info('Rebuilding Mysql db with table name suffix: ' + tablenameSuffix)
  }
  const startTime = new Date()
  const startTimeMs = startTime.getTime()
  let groupNames;
  const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: 'mysql',
      port: 3306,
      user: 'root',
      password: `${process.env.T_MYSQL_PASSWORD}`
    }
  });

  if (process.env.T_ONLY_PROCESS_THESE_GROUPS && process.env.T_ONLY_PROCESS_THESE_GROUPS !== '') {
    // groupNames = process.env.T_ONLY_PROCESS_THESE_GROUPS.split(',')
    groupNames = process.env.T_ONLY_PROCESS_THESE_GROUPS
      ? JSON.parse(process.env.T_ONLY_PROCESS_THESE_GROUPS.replace(/\'/g, `"`))
      : []
    log.info('groupNames from T_ONLY_PROCESS_THESE_GROUPS: ' + groupNames)
  } else {
    groupNames = await groupsList()
  }
  
  for (let groupId of groupNames) {
    let tableName, docType, createFunction, primaryKey
    // const mysqlDbName = groupId.replace(/-/g, '')
    const pathToStateFile = `/mysql-module-state/${groupId}.ini`

    tableName = 'participant' + tablenameSuffix
    docType = 'participant'
    primaryKey = 'participantID'
    createFunction = function (t) {
      t.engine('InnoDB')
      t.string(primaryKey, 36).notNullable().primary();
      t.string('CaseID', 36).index('participant_CaseID_IDX');
      t.double('inactive');
    }
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
    await queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, undefined, tablenameSuffix);
    log.info('Finished processing: ' + tableName)

    tableName = 'case_instances' + tablenameSuffix
    docType = 'case'
    primaryKey = 'CaseID'
    createFunction = function (t) {
      t.engine('InnoDB')
      t.string(primaryKey, 36).notNullable().primary();
      t.integer('complete');
      t.bigint('startunixtime');//TODO: is this being set properly in mysql?
    }
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
    await queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, undefined, tablenameSuffix);
    log.info('Finished processing: ' + tableName)
    
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
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
    await queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, undefined, tablenameSuffix);
    log.info('Finished processing: ' + tableName)
    
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
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await createTable(knex, groupId, tableName, docType, createFunction, primaryKey)
    await queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, undefined, tablenameSuffix);
    
    log.info('Finished processing: ' + tableName)
    
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
    // await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await queryAndConvertDocuments(groupId, docType, knex, pathToStateFile, tableName, primaryKey, createFunction, tablenameSuffix);
    log.info('Finished processing responses.')
  }

  /**
   * credit: http://www.4codev.com/javascript/convert-seconds-to-time-value-hours-minutes-seconds-idpx6943853585885165320.html
   * @param value
   * @returns {string}
   */
  function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
  }
  
  const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
  // await sleep(60* 1000)
  const endTime = new Date()
  const endTimeMs = endTime.getTime()
  const diffMs = endTimeMs - startTimeMs;
  log.info(' Finished converting all documents in ' + diffMs + ' milliSeconds or ' + (diffMs / 1000) + ' seconds.')
  // const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  const duration = convertHMS((diffMs / 1000))
  log.info('Started: ' + startTime + ' Ended: ' + endTime + ' Duration (HH:MM:SS): ' + duration);
}

module.exports = rebuildMysqlDb