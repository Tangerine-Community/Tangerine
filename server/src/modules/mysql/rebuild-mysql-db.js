const groupsList = require('../../groups-list.js')
const DB = require(`../../db.js`)
const {log} = require("tangy-log");
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function dropTable(groupId, tableName) {
  const mysqlDbName = groupId.replace(/-/g, '')
  try {
    await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p${process.env.T_MYSQL_PASSWORD} -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
    log.info(`Dropped ${tableName} for ${groupId}`)
  } catch (e) {
    log.error(`Error dropping table ${tableName} in group ${groupId}`, e)
  }
}

async function convert_participant(knex, doc, groupId, tableName) {
  if (!tableName) {
    tableName = 'participant'
  }
  const caseId = doc.caseId
  const participantId = doc._id
  const dbRev = doc._rev
  const role = doc.caseRoleId
  const participantData = doc.data
  let newRecord = false
  if (participantData['participantID']) {
    // log.info('Already have participantID: ' + participantId)
  } else {
    // log.info('Adding record for ParticipantID: ' + participantId)
    participantData['participantID'] = participantId
  }
  if (!participantData['CaseID']) {
    participantData['CaseID'] = caseId
  }
  if (!participantData['caseRoleId']) {
    participantData['caseRoleId'] = role
  }
  if (!participantData['dbRevision']) {
    participantData['dbRevision'] = dbRev
  }
  // log.info(`participantData: ${JSON.stringify(participantData)}`)
  // log.info(`doc: ${JSON.stringify(doc)}`)

  // # Delete the following keys;
  const valuesToRemove = ['data', 'caseId', 'participantId', '_id', '_rev', 'caseRoleId', 'id', 'type']
  // const filteredParticipantData = participantData.filter(item => !valuesToRemove.includes(item))
  valuesToRemove.forEach(e => delete doc[e]);
  // log.info(`doc: ${JSON.stringify(doc)}`)

// # Check to see if we have any additional data elements that we need to convert and save to MySQL database.
  if (doc) {
    for (const [key, value] of Object.entries(doc)) {
      if (doc.hasOwnProperty(key) && key !== 'data') {
        // log.info(`key: ${key}; value: ${value}`)
        try {
          participantData[key] = value
        } catch (e) {
          log.info(`ERROR: key: ${key}; value: ${value}`)
          log.error(e)
        }
      }
    }
  }
// # RJ: Do we need a df.rename() like we do on other types of data?
// # Try 3 things to insert data...
// #     1) Insert the data as a new or updated row. If that fails...
// #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
// #     3) Then the database doesn't exist! Just insert it.
  
  // })
  
  // const tableExists = knex.schema.withSchema(groupId.replace(/-/g, '')).hasTable(tableName)
  // console.log("tableExists: " + tableExists)
  
  // if (!tableExists) {
  //  
  // }
  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let schemaUpdated = false;
  const mysqlDbName = groupId.replace(/-/g, '')
  let infoOriginal = await knex(mysqlDbName + '.' + tableName).columnInfo();
  if (infoOriginal) {
    // info: {"ParticipantID":{"defaultValue":null,"type":"varchar","maxLength":36,"nullable":false}}
    const infoKeys = Object.keys(infoOriginal)
    const infoKeysLower = infoKeys.map(e => e.toLowerCase())
    // log.info(`infoKeys: ${JSON.stringify(infoKeysLower)}`)
    const participantDataKeys = Object.keys(participantData)
    for (let i = 0; i < participantDataKeys.length; i++) {
      const e = participantDataKeys[i]
      if (!infoKeysLower.includes(e.toLowerCase())) {
        log.info(`Adding column ${e} to table ${tableName}`)
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
      log.info("Inserting the data - or upserting -  for participant: " + participantId)
      const mysqlDbName = groupId.replace(/-/g, '')
      await knex(mysqlDbName + '.' + tableName).insert(participantData).onConflict('ParticipantID').merge()
    } catch (e) {
      if (e.code && e.code === 'ER_DUP_ENTRY') {
        log.error(`Duplicate record for ParticipantID ${participantId}`)
      } else {
        log.error(e)
      }
    }
    if (schemaUpdated) {
      log.info(`Schema updated for table ${tableName}`)
      log.info(`Original schema: ${JSON.stringify(infoOriginal)}`)
      const infoUpdated = await knex(tableName).columnInfo()
      log.info(`Updated schema: ${JSON.stringify(infoUpdated)}`)
      log.info(`participantData: ${JSON.stringify(participantData)}`)
    }
    
  } else {
    log.info(`ERROR: Unable to get schema.`)
  }

}

async function convert_case(knex, doc, groupId, tableName) {
  const caseDefID = doc.caseDefinitionId
  const caseId = doc._id
  const dbRev = doc._rev
  const collection = doc.collection
  const startDatetime = doc.startDatetime
  const uploadDatetime = doc.uploadDatetime
  const data = doc.data

  let newRecord = false
  
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
  // log.info(`data: ${JSON.stringify(data)}`)
  // log.info(`doc: ${JSON.stringify(doc)}`)
  
// # RJ: Do we need a df.rename() like we do on other types of data?
// # Try 3 things to insert data...
// #     1) Insert the data as a new or updated row. If that fails...
// #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
// #     3) Then the database doesn't exist! Just insert it.

  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let schemaUpdated = false;
  const mysqlDbName = groupId.replace(/-/g, '')
  let infoOriginal = await knex(mysqlDbName + '.' + tableName).columnInfo();
  if (infoOriginal) {
    // info: {"ParticipantID":{"defaultValue":null,"type":"varchar","maxLength":36,"nullable":false}}
    const infoKeys = Object.keys(infoOriginal)
    const infoKeysLower = infoKeys.map(e => e.toLowerCase())
    // log.info(`infoKeys: ${JSON.stringify(infoKeysLower)}`)
    const dataKeys = Object.keys(data)
    for (let i = 0; i < dataKeys.length; i++) {
      const e = dataKeys[i]
      if (!infoKeysLower.includes(e.toLowerCase())) {
        log.info(`Adding column ${e} to table ${tableName}`)
        try {
          await knex.schema.withSchema(groupId.replace(/-/g, '')).alterTable(tableName, function (t) {
            t.text(e)
          })
          schemaUpdated = true
        } catch (e) {
          if (e.code && e.code === 'ER_DUP_FIELDNAME') {
            // log.error(`Column ${e} already exists in table ${tableName}`)
          } else {
            log.error(e)
          }
        }
      }
    }
    // Now insert the data
    try {
      log.info("Inserting the data - or upserting -  for caseId: " + caseId)
      const mysqlDbName = groupId.replace(/-/g, '')
      await knex(mysqlDbName + '.' + tableName).insert(data).onConflict('caseId').merge()
    } catch (e) {
      if (e.code && e.code === 'ER_DUP_ENTRY') {
        log.error(`Duplicate record for ParticipantID ${participantId}`)
      } else {
        log.error(e)
      }
    }
    if (schemaUpdated) {
      log.info(`Schema updated for table ${tableName}`)
      log.info(`Original schema: ${JSON.stringify(infoOriginal)}`)
      const infoUpdated = await knex(tableName).columnInfo()
      log.info(`Updated schema: ${JSON.stringify(infoUpdated)}`)
      log.info(`data: ${JSON.stringify(data)}`)
    }
    
  } else {
    log.info(`ERROR: Unable to get schema.`)
  }

}


async function generateMysqlRecord(conn, pathToStateFile, groupId, tableName, doc) {
  const type = doc.type
  // log.info(`type: ${type}`)
  if (type) {
    if (type === 'participant') {
      await convert_participant(conn, doc, groupId, tableName)
    } else if (type.toLowerCase() === 'case') {
      await convert_case(conn, doc, groupId, tableName)
    }
  }
}


async function generateDatabase(knex, groupId, tableName, viewName) {
  // await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
  // log.info(`Dropped ${tableName} for ${groupId}`)
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  // user : `${process.env.T_MYSQL_USER} ` ,
  const mysqlTableName = groupId.replace(/-/g, '');
  const results = await knex.raw('SELECT COUNT(*) AS CNT \n' +
    'FROM information_schema.tables\n' +
    'WHERE table_schema = ? \n' +
    '    AND table_name = ? \n' +
    'LIMIT 1;', [mysqlTableName, tableName])
  const values = results[0][0]
  const cnt = values['CNT']
  // console.log("results: " + JSON.stringify(results) + " type: " + typeof results)
  // console.log("values: " + JSON.stringify(values) + " type: " + typeof values)
  let tableExists = false
  if (cnt === 1) {
    tableExists = true;
  }

  // const tableExists = await knex.schema.hasTable(groupId.replace(/-/g, '') + '.' + tableName)

  // await knex.schema.hasTable(groupId.replace(/-/g, '') + '.' + tableName).then(async function (exists) {
  log.info("tableExists: " + tableExists)
  if (!tableExists) {
    log.info(`Table ${tableName} does not exist. Creating...`)
    // const results = await knex.schema.withSchema(groupId.replace(/-/g, '')).createTable(tableName, function (t) {
    let createFunction;
    if (tableName.startsWith('participant')) {
      createFunction = function (t) {
        t.engine('InnoDB')
        t.string('ParticipantID', 36).notNullable().primary();
        t.string('CaseID', 36).index('CaseID_IDX');
      }
    } else if (tableName.startsWith('case_instances')) {
      createFunction = function (t) {
        t.engine('InnoDB')
        t.string('ParticipantID', 36).index('ParticipantID_IDX');
        t.string('CaseID', 36).notNullable().primary();
      }
    }
    try {
      const results = await knex.schema.createTable(groupId.replace(/-/g, '') + '.' + tableName, createFunction);
      log.info("Table create results: " + JSON.stringify(results))
    } catch (e) {
      log.error(`Error creating table ${tableName} Error: ${e}`)
    }
  }
  
  // Do a query and create the table
  const reportingDb = DB(`${groupId}-mysql`)
  try {
    const docs = await reportingDb.query(viewName)
    log.info("db.rows.length: " + docs.rows.length)
    for (let i = 0; i < docs.rows.length; i++) {
      // log.info("Processing doc: " + i + " of " + allDocs.rows.length)
      const entry = docs.rows[i]
      const doc = await reportingDb.get(entry.id)
      // log.info("Got doc: " + doc.id)
      if ( doc._id.startsWith('_design') ) {
        // log.info("Skipping design doc: " + JSON.stringify(doc))
      } else {
        await generateMysqlRecord(knex, pathToStateFile, groupId, tableName, doc)
      }
    }
  } catch (err) {
    log.info("error: " + JSON.stringify(err))
  }

}

/**
 * T_REBUILD_MYSQL_DBS
 * @returns {Promise<void>}
 */
async function rebuildMysqlDb() {
  log.info('Rebuilding Mysql db') 
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
  
  if (process.env.T_REBUILD_MYSQL_DBS && process.env.T_REBUILD_MYSQL_DBS !== '') {
    // groupNames = process.env.T_REBUILD_MYSQL_DBS.split(',')
    groupNames = process.env.T_REBUILD_MYSQL_DBS
      ? JSON.parse(process.env.T_REBUILD_MYSQL_DBS.replace(/\'/g,`"`))
      : []
    log.info('groupNames from T_REBUILD_MYSQL_DBS: ' + groupNames)
  } else {
    groupNames = await groupsList()
  }
  for (let groupId of groupNames) {
    let tableName, viewName;
    // const mysqlDbName = groupId.replace(/-/g, '')
    
    tableName = 'participant_test';
    viewName = 'byParticipant';
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await generateDatabase(knex, groupId, tableName, viewName)
    
    tableName = 'case_instances_test';
    viewName = 'byCase';
    await knex.schema.withSchema(groupId.replace(/-/g, '')).dropTableIfExists(tableName)
    await generateDatabase(knex, groupId, tableName, viewName)
  }
}

module.exports = rebuildMysqlDb