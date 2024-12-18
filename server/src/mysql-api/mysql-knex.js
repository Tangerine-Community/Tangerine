// check to make sure the packages are installed
require('knex');
require('mysql2');

var _config =  {
  host: process.env.T_MYSQL_CONTAINER_NAME || '127.0.0.1',
  port: process.env.T_MYSQL_PORT || 3306,
  user: process.env.T_MYSQL_USER || 'admin',
  password: process.env.T_MYSQL_PASSWORD || 'password'
}

var KNEX = undefined

async function initializeConnection(mysqlDbName='voss_project', config=_config) {
  try {
    KNEX = require('knex') ({
      client: 'mysql2',
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: mysqlDbName,
      },
      pool: { min: 0, max: 7 }
    })
  } catch (e) {
    if (e.code == 'ETIMEDOUT') {
      console.log('Connection to MySQL server timed out.')
    } else {
      throw e;
    }
  }
}

async function testMySQLConnection() {
  try {
    const results = await KNEX.raw('SELECT 1 + 1 AS solution')
    if (results[0][0].solution === 2) {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

async function closeConnection() {
  if (KNEX) {
    await KNEX.destroy()
  }
}

async function getTableData(schema, table, columns=[], where=undefined, join=undefined, groupby=[])
{
  const cols = columns.length > 0 ? columns.join(', ') : '*'
  const joinClause = join ? `JOIN ${join}` : ''
  const whereClause = where ? `WHERE ${where}` : ''
  const groupByClause = groupby.length > 0 ? `GROUP BY ${groupby.join(', ')}` : ''
  const results = await KNEX.raw(`SELECT ${cols} FROM ${schema}.${table} ${joinClause} ${whereClause} ${groupByClause}`)
  return results
}

module.exports = {
  initializeConnection,
  closeConnection,
  testMySQLConnection,
  getTableData,
}