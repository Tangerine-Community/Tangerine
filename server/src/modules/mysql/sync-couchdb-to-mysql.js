const {log} = require("tangy-log");
const groupsList = require("../../groups-list");
const DB = require(`../../db.js`)

async function compareRevs(tablenameSuffix) {
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

  if (process.env.T_REBUILD_MYSQL_DBS && process.env.T_REBUILD_MYSQL_DBS !== '') {
    // groupNames = process.env.T_REBUILD_MYSQL_DBS.split(',')
    groupNames = process.env.T_REBUILD_MYSQL_DBS
      ? JSON.parse(process.env.T_REBUILD_MYSQL_DBS.replace(/\'/g, `"`))
      : []
    log.info('groupNames from T_REBUILD_MYSQL_DBS: ' + groupNames)
  } else {
    groupNames = await groupsList()
  }

  for (let groupId of groupNames) {
    // get allDocs for this db
    const reportingDb = DB(`${groupId}-mysql`)
    let docs;
    const tables = []
    try {
      docs = await reportingDb.allDocs()
      log.info("db.rows.length: " + docs.rows.length)
    } catch (err) {
      log.info("error: " + JSON.stringify(err))
    }
    for (let doc of docs.rows) {
      if (doc.id.indexOf('_design') === -1) {
        // tables.push(doc.id)
        const id = doc.id
        const rev = doc.value?.rev
        console.log("id: " + id + " rev: " + rev)
      }
    }
    // then lookup based on datatype

  }
}

module.exports = compareRevs