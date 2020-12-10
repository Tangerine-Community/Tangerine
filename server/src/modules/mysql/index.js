const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra');
const mysql = require( 'mysql' );
const groupsList = require('../../groups-list.js');

class MysqlDatabase {
  constructor(config) {
    //this.connection = mysql.createConnection( config );
    this.config = config
  }
  query( sql, database ) {
    return exec(`mysql -u ${this.config.user}@${this.config.host} ${database ? `--database="${database}" `: ''}-p"${this.config.password} -e "${sql.replaceAll('"', '\"')}"`)
    /*
    return new Promise( ( resolve, reject ) => {
      this.connection.query( sql, args, ( err, rows ) => {
        if ( err )
          return reject( err );
        resolve( rows );
      } );
    } );
    */
  }
  close() {
    return new Promise( ( resolve, reject ) => {
      this.connection.end( err => {
        if ( err )
          return reject( err );
        resolve();
      } );
    } );
  }
}

module.exports = {
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
      const { groupNames } = data
      for (let groupName of groupNames) {
      }
      return data
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        const groupId = groupName
        const mysqlDbName = groupId.replace(/-/g,'')
        console.log(`Creating mysql db ${mysqlDbName}`)
        await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
        console.log(`Created mysql db ${mysqlDbName}`)
        const mysqlDb = new MysqlDatabase({
          host     : 'mysql',
          user     : process.env.T_MYSQL_USER,
          password : process.env.T_MYSQL_PASSWORD,
          database : mysqlDbName 
        })
        console.log('Running CreateTables.sql')
        //const mysqlDbInitializeCommands = await fs.readFile('/tangerine/server/src/modules/mysql/CreateTables.sql')
        //await mysqlDb.query(mysqlDbInitializeCommands, groupId)

        await exec(`mysql -u ${process.env.T_MYSQL_USER} --database="${mysqlDbName}" -h mysql -p"${process.env.T_MYSQL_PASSWORD}" < /tangerine/server/src/modules/mysql/CreateTables.sql`)
        console.log('Ran CreateTables.sql')
        console.log('Creating tangerine to mysql state file...')
        const state = `
[TANGERINE]
DatabaseURL = http://couchdb:5984/
DatabaseName = ${groupId}-synapse
DatabaseUserName = ${process.env.T_COUCHDB_USER_ADMIN_NAME} 
DatabasePassword = ${process.env.T_COUCHDB_USER_ADMIN_PASS} 
LastSequence = 0
run_interval = 10

[MySQL]
HostName = mysql 
DatabaseName = ${mysqlDbName} 
UserName = ${process.env.T_MYSQL_USER} 
Password = ${process.env.T_MYSQL_PASSWORD} 
        `
        const pathToStateFile = `/mysql-module-state/${groupId}.ini`
        await fs.writeFile(pathToStateFile, state)
        console.log('Created tangerine to mysql state file.')
        startTangerineToMySQL(pathToStateFile)
        resolve(data)
      })
    }
  }

}

async function startTangerineToMySQL(pathToStateFile) {
  try {
    await exec(`python3 /tangerine/server/src/modules/mysql/TangerineToMySQL.py ${pathToStateFile}`)
  } catch(e) {
    console.error(e)
  }
}
