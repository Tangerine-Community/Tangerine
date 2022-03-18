const groupsList = require('../../groups-list.js')
const DB = require(`../../db.js`)
const {log} = require("tangy-log");
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function dropTable(groupId, tableName) {
  const mysqlDbName = groupId.replace(/-/g, '')
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p${process.env.T_MYSQL_PASSWORD} -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
  log.info(`Dropped ${tableName} for ${groupId}`)
}

/**
 * Credit: https://bobbyhadz.com/blog/javascript-lowercase-object-keys
 * @param obj
 * @returns {{[p: string]: *}}
 */
function toLowerKeys(obj) {
  // 👇️ [ ['NAME', 'Tom'], ['AGE', 30] ]
  const entries = Object.entries(obj);

  return Object.fromEntries(
    entries.map(([key, value]) => {
      return [key.toLowerCase(), value];
    }),
  );
}


async function convert_participant(knex, doc, tableName) {
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
  const tableExists = await knex.schema.hasTable(tableName)
  
  if (!tableExists) {
    log.info(`Table ${tableName} does not exist. Creating...`)
    const results = await knex.schema.createTable(tableName, function (t) {
      t.engine('InnoDB')
      t.string('ParticipantID', 36).notNullable().primary();
    });
    log.info("Table create results: " + JSON.stringify(results))
  }
  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let schemaUpdated = false;
  let infoOriginal = await knex(tableName).columnInfo();
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
          await knex.schema.alterTable(tableName, function (t) {
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
      await knex(tableName).insert(participantData).onConflict('ParticipantID').merge()
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


async function generateMysqlRecord(conn, pathToStateFile, groupId, tableName, doc) {
  const type = doc.type
  // log.info(`type: ${type}`)
  if (type) {
    if (type === 'participant') {
      await convert_participant(conn, doc, 'participant_test')
    }
  }
}


async function generateDatabase(groupId, tableName) {
  const mysqlDbName = groupId.replace(/-/g, '')
  // await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
  // log.info(`Dropped ${tableName} for ${groupId}`)
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  // user : `${process.env.T_MYSQL_USER} ` ,
  const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: 'mysql',
      port: 3306,
      user: 'root',
      password: `${process.env.T_MYSQL_PASSWORD}`,
      database: mysqlDbName
    }
  });
  // Do a byParticipant query and create the table
  const reportingDb = DB(`${groupId}-mysql`)
  try {
    const docs = await reportingDb.query(`byParticipant`)
    log.info("byParticipant.rows.length: " + docs.rows.length)
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
      // await generateMysqlRecord(knex, pathToStateFile, groupId, tableName, doc)
    }
  } catch (err) {
    log.info("error: " + err)
  }

}

/**
 * T_REBUILD_MYSQL_DBS
 * @returns {Promise<void>}
 */
async function rebuildMysqlDb() {
  log.info('Rebuilding Mysql db') 
  let groupNames;
  
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
    try {
      await dropTable(groupId, 'participant_test')
    } catch (e) {
      log.info(e)
    }
    await generateDatabase(groupId)
  }
}

module.exports = rebuildMysqlDb