const groupsList = require('../../groups-list.js')
const {REPORTING_WORKER_PAUSE, REPORTING_WORKER_RUNNING} = require("../../reporting/constants");
const {pathExists} = require("fs-extra");
const DB = require(`../../db.js`)
const {spawn} = require("child_process");
const {log} = require("tangy-log");
const util = require("util");
const exec = util.promisify(require('child_process').exec)

async function dropTable(groupId, tableName) {
  const mysqlDbName = groupId.replace(/-/g, '')
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p${process.env.T_MYSQL_PASSWORD} -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
  console.log(`Dropped ${tableName} for ${groupId}`)
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
  if (participantData['participantID']) {
    console.log('Already have participantID: ' + participantId)
  } else {
    console.log('Adding ParticipantID: ' + participantId)
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
  console.log(`participantData: ${JSON.stringify(participantData)}`)
  console.log(`doc: ${JSON.stringify(doc)}`)

  // # Delete the following keys;
  const valuesToRemove = ['data', 'caseId', 'participantId', '_id', '_rev', 'caseRoleId', 'id', 'type']
  // const filteredParticipantData = participantData.filter(item => !valuesToRemove.includes(item))
  valuesToRemove.forEach(e => delete doc[e]);
  console.log(`doc: ${JSON.stringify(doc)}`)

// # Check to see if we have any additional data elements that we need to convert and save to MySQL database.
  if (doc) {
    for (const [key, value] of Object.entries(doc)) {
      if (doc.hasOwnProperty(key) && key !== 'data') {
        // console.log(`key: ${key}; value: ${value}`)
        try {
          participantData[key] = value
        } catch (e) {
          console.log(`ERROR: key: ${key}; value: ${value}`)
          console.error(e)
        }
      }
    }
  }
  // console.log(`doc: ${JSON.stringify(doc)}`)

// # RJ: Do we need a df.rename() like we do on other types of data?
// # Try 3 things to insert data...
// #     1) Insert the data as a new or updated row. If that fails...
// #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
// #     3) Then the database doesn't exist! Just insert it.
  knex.schema.hasTable(tableName).then(async function (exists) {
    if (!exists) {
      console.log(`Table ${tableName} does not exist. Creating...`)
      return knex.schema.createTable(tableName, function (t) {
        t.engine('InnoDB')
        t.string('ParticipantID', 36).notNullable().primary();
      });
    }
  })
  // look at the schema and see if it matches the data we're inserting.
  // if it does, then we can just insert the data.
  let info = await knex(tableName).columnInfo();
  if (info) {

    // info: {"ParticipantID":{"defaultValue":null,"type":"varchar","maxLength":36,"nullable":false}}
    console.log(`schema: ${JSON.stringify(info)}`)
    const infoKeys = Object.keys(info)
    const participantDataKeys = Object.keys(participantData)
    for (let i = 0; i < participantDataKeys.length; i++) {
      const e = participantDataKeys[i]
      if (!infoKeys.includes(e)) {
        console.log(`Adding column ${e} to table ${tableName}`)
        try {
          await knex.schema.alterTable(tableName, function (t) {
            t.string(e, 100)
          })
        } catch (e) {
          if (e.code && e.code === 'ER_DUP_FIELDNAME') {
            console.error(`Column ${e} already exists in table ${tableName}`)
          } else {
            console.error(e)
          }
        }
      }
    }
    // Now insert the data
    try {
      console.log("Inserting the data - or upserting. Yes, UPSERT!")
      await knex(tableName).insert(participantData).onConflict('ParticipantID').merge()
    } catch (e) {
      if (e.code && e.code === 'ER_DUP_ENTRY') {
        console.error(`Duplicate record for ParticipantID ${participantId}`)
      } else {
        console.error(e)
      }
    }

    info = await knex(tableName).columnInfo()
    console.log(`updated schema: ${JSON.stringify(info)}`)
  } else {
    console.log(`ERROR: info: ${JSON.stringify(info)}`)
  }

}


async function generateMysqlRecord(conn, pathToStateFile, groupId, tableName, doc) {
  const type = doc.type
  if (type) {
    if (type === 'participant') {
      await convert_participant(conn, doc, 'participant_test')
    }
  }
}


async function generateDatabase(groupId, tableName) {
  const mysqlDbName = groupId.replace(/-/g, '')
  // await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP TABLE ${mysqlDbName}.${tableName};"`)
  // console.log(`Dropped ${tableName} for ${groupId}`)
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
  // Do an alldocs query and create the table
  const reportingDb = DB(`${groupId}-mysql`)
  try {
    const allDocs = await reportingDb.get(`_all_docs`)
    // console.log("check out these docs: " + JSON.stringify(allDocs))
    for (let i = 0; i < allDocs.rows.length; i++) {
      const entry = allDocs.rows[i]
      const doc = await reportingDb.get(entry.id)
      await generateMysqlRecord(knex, pathToStateFile, groupId, tableName, doc)
    }
  } catch (err) {
    console.log("error: " + err)
  }

}

async function rebuildMysqlDb() {
  console.log('Rebuilding Mysql db')
  const groupNames = await groupsList()
  for (let groupId of groupNames) {
    // try {
    //   await dropTable(groupId, 'participant_test')
    // } catch (e) {
    //   console.log(e)
    // }
    await generateDatabase(groupId)
  }
}

module.exports = rebuildMysqlDb