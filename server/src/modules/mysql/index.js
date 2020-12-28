const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const fs = require('fs-extra');
const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

/* Enable this if you want to run commands manually when debugging.
const exec = async function(cmd) {
  console.log(cmd)
}
*/

module.exports = {
  name: 'mysql',
  hooks: {
    boot: async function(data) {
      const groups = await groupsList()
      for (groupId of groups) {
        const pathToStateFile = `/mysql-module-state/${groupId}.ini`
        startTangerineToMySQL(pathToStateFile)
      }
      return data
    },
    clearReportingCache: async function(data) {
      // @TODO
      const { groupNames } = data
      for (let groupName of groupNames) {
      }
      return data
    },
    enable: async function() {
      const groups = await groupsList()
      for (groupId of groups) {
        await initializeGroupForMySQL(groupId)
      }
    },
    disable: function(data) {

    },
    groupNew: async function(data) {
      const {groupName} = data
      const groupId = groupName
      await initializeGroupForMySQL(groupId)
      const pathToStateFile = `/mysql-module-state/${groupId}.ini`
      startTangerineToMySQL(pathToStateFile)
      return data
    }
  }

}

async function initializeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  console.log(`Creating mysql db ${mysqlDbName}`)
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
  console.log(`Created mysql db ${mysqlDbName}`)
  console.log('Creating tangerine to mysql state file...')
  const state = `[TANGERINE]
DatabaseURL = http://couchdb:5984/
DatabaseName = ${groupId}-synapse
DatabaseUserName = ${process.env.T_COUCHDB_USER_ADMIN_NAME} 
DatabasePassword = ${process.env.T_COUCHDB_USER_ADMIN_PASS} 
LastSequence = 0
run_interval = 1

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
    await exec(`python3 /tangerine/server/src/modules/mysql/TangerineToMySQL.py ${pathToStateFile}`)
  } catch(e) {
    console.error(e)
  }
}
