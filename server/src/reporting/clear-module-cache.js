#!/usr/bin/env node
const pathExists = require('fs-extra').pathExists
const promisify = require('util').promisify
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const unlink = promisify(require('fs').unlink)
const groupsList = require('../groups-list.js')
const tangyModules = require('../modules/index.js')()
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

const util = require('util');
const exec = util.promisify(require('child_process').exec)

const { 
  REPORTING_WORKER_PAUSE, 
  REPORTING_WORKER_STATE,
  REPORTING_WORKER_RUNNING
} = require('./constants')
const fs = require("fs-extra");

async function removeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "DROP DATABASE ${mysqlDbName};"`)
  const pathToStateFile = `/mysql-module-state/${groupId}.ini`
  await unlink(pathToStateFile)
  console.log(`Removed state file and database for ${groupId}`)
}

async function initializeGroupForMySQL(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  console.log(`Creating mysql db ${mysqlDbName}`)
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" -e "CREATE DATABASE ${mysqlDbName};"`)
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

async function clearReportingCache() {
  console.log('Pausing reporting working...')
  await writeFile(REPORTING_WORKER_PAUSE, '', 'utf-8')
  console.log('Waiting for current reporting worker to stop...')
  let reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
  while (reportingWorkerRunning) {
    reportingWorkerRunning = await pathExists(REPORTING_WORKER_RUNNING)
    if (reportingWorkerRunning) await sleep(1*1000)
  }
  console.log('Clearing reporting caches...')
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    await removeGroupForMySQL(groupName)
    await initializeGroupForMySQL(groupName)
  }
  await unlink(REPORTING_WORKER_PAUSE)
  console.log('Reporting caches cleared.')
}

module.exports = clearReportingCache