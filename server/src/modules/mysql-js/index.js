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
const mysql = require('mysql2/promise');
const {changeProcessor} = require("../../reporting/data-processing");
const Logger = require('@nestjs/common').Logger;

/* Enable this if you want to run commands manually when debugging.
const exec = async function(cmd) {
  console.log(cmd)
}

*/

module.exports = {
  name: 'mysql-js',
  inject: async (key, value, config) => {
    this.injected[key] = value
    // console.log("Injected", this.injected.connection)
  },
  injected: {},
  hooks: {
    foo: "bar",
    reportingWorkerBatchStart: async function(workerState) {
      // console.log('mysql-js reportingWorkerBatchStart creating a mysql connection. ')
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
        connection = await mysql.createConnection({host: hostname, user: username, password: password});
        // console.log("connection.workerState: " + JSON.stringify(connection.workerState))
        // const [rows, fields] = await connection.query('show databases');
        // log.info(`rows: ${JSON.stringify(rows)}`)
      } catch (e) {
        log.error(e)
      }
      if (connection) {
        this.inject('connection', connection, workerState)
        console.log("injected connection in reportingWorkerBatch hook in mysql-js module")
      }
        // inject('foo', true)
      let processed = 0
      for (let database of workerState.databases) {
        const db = new DB(database.name)
        const changes = await db.changes({
          since: database.sequence,
          limit: workerState.batchSizePerDatabase,
          include_docs: false
        })
        if (changes.results.length > 0) {
          for (let change of changes.results) {
            try {
              // await changeProcessor(change, db, tangyModules.injected)
              console.log("mysql-js checking change: " + change.id)
              processed++
            } catch (error) {
              let errorMessage = JSON.stringify(error)
              let errorMessageText = error.message

              // Sometimes JSON.stringify wipes out the error.
              console.log("typeof error message: " + typeof error.message + " errorMessage: " + errorMessage + " errorMessageText: " + errorMessageText)
              if (typeof error.message === 'object') {
                errorMessageText = JSON.stringify(error.message)
              }
              if (errorMessage === '{}') {
                errorMessage = "Error : " + " message: " + errorMessageText
              } else {
                errorMessage = "Error : " + " message: " + errorMessageText + " errorMessage: " + errorMessage
              }
              log.error(`Error on change sequence ${change.seq} with id ${change.id} - Error: ${errorMessage} ::::: `)
            }
          }
        }
      }
      // }
    },
    reportingWorkerBatchEnd: async function(workerState, inject, injected) {
      // console.log('mysql-js reportingWorkerBatchEnd ',injected.foo)
      // console.log('mysql-js reportingWorkerBatchEnd ')
      if (injected.connection) {
        injected.foo = "WHOA!"
        await injected.connection.end((err) => {
          log.info("Ending mysql connection.")
          // The connection is terminated now
          if (err) {
            log.error(err)
          }
        });
      }
      // console.log('mysql-js reportingWorkerBatchEnd ',injected.foo)
    },
    boot: async function(data) {
      const groups = await groupsList()
      const logger = new Logger("mysql-js");
      logger.log("booting mysql-js module for groups: " + JSON.stringify(groups))
      let groupId;
      for (groupId of groups) {
        const pathToStateFile = `/mysql-module-state/${groupId}.ini`
        await this.reportingWorkerBatchStart(pathToStateFile)
      }
      return data
    },
    enable: async function() {
      let mysqlGroups = process.env.T_MYSQL_GROUPS
        ? JSON.parse(process.env.T_MYSQL_GROUPS.replace(/\'/g,`"`))
        : []
      log.info("enabling mysql-js module for groups: " + JSON.stringify(mysqlGroups))
      let groupId;
      for (groupId of mysqlGroups) {
        // The mysql dbs were already created by mysql module's enable hook.
        // await initializeGroupForMySQL(groupId)
      }
    },


    reportingOutputs: async function(data) {
        // const {doc, sourceDb, injected} = data
      const {doc, sourceDb, sequence, reportingConfig, injected} = data
      console.log("reportingOutputs hook in mysql-js module", injected.foo)
      if (injected.connection) {
        const connection = injected.connection
        const mysqlDbName = sourceDb.name.replace(/-/g, '')

        connection.changeUser({
          database: mysqlDbName
        }, (err) => {
          if (err) {
            console.log('Error in changing database', err);
            return;
          }
          // Do another query
        })

        async function generateDatabase(sourceDb, targetDb, doc, locationList, sanitized, exclusions, connection) {
          if (exclusions && exclusions.includes(doc.form.id)) {
            // skip!
          } else {
            if (doc.type === 'case') {
              // output case
              await saveFlatResponse(doc, locationList, targetDb, sanitized, connection);
              let numInf = getItemValue(doc, 'numinf')
              let participant_id = getItemValue(doc, 'participant_id')

              // output participants
              for (const participant of doc.participants) {
                await pushResponse({
                  ...participant,
                  _id: participant.id,
                  caseId: doc._id,
                  numInf: participant.participant_id === participant_id ? numInf : '',
                  type: "participant"
                }, targetDb, connection);
              }

              // output case-events
              for (const event of doc.events) {
                // output event-forms
                if (event['eventForms']) {
                  for (const eventForm of event['eventForms']) {
                    // for (let index = 0; index < event['eventForms'].length; index++) {
                    // const eventForm = event['eventForms'][index]
                    try {
                      await pushResponse({...eventForm, type: "event-form", _id: eventForm.id}, targetDb, connection);
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
                await pushResponse({...eventClone, _id: eventClone.id, type: "case-event"}, targetDb, connection)
              }
            } else {
              // non-case docs
              await saveFlatResponse(doc, locationList, targetDb, sanitized, connection);
            }
          }
        }

        const logger = new Logger("mysql-js");
        const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
        // const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
        const groupsDb = await new DB(`groups`);
        const groupDoc = await groupsDb.get(`${sourceDb.name}`)
        const exclusions = groupDoc['exclusions']
        if (connection) {
          console.log("We have a connection.  Let's process the data!")
          connection.on('error', function (err) {
            log.info(`mysql connection error: ${JSON.stringify(err)}`)
          });
        }

        // First generate the full-cream database
        let mysqlDb
        try {
          mysqlDb = await new DB(`${sourceDb.name}-mysql`);
        } catch (e) {
          console.log("Error creating db: " + JSON.stringify(e))
        }
        let sanitized = false;
        try {
          await generateDatabase(sourceDb, mysqlDb, doc, locationList, sanitized, exclusions, connection);
        } catch (e) {
          console.log("Error generating database: " + e)
          // if (e.includes("ERROR 1050")) {
          //   // it's OK, Table already exists
          // } else {
          //   console.log("Error generating database: " + e)
          // }
        } finally {
          // await connection.end(function (err) {
          //   log.info("Ending mysql connection.")
          //   // The connection is terminated now
          //   if (err) {
          //     log.error(err)
          //   }
          // });
        }
      } else {
        log.error("No mysql connection!")
      }
      return data
    }
  }
}


async function loadMysqlScript(groupId) {
  const mysqlDbName = groupId.replace(/-/g,'')
  console.log(`Loading mysql script into ${mysqlDbName}`)
  await exec(`mysql -u ${process.env.T_MYSQL_USER} -h mysql -p"${process.env.T_MYSQL_PASSWORD}" ${mysqlDbName} < /tangerine/server/src/modules/mysql-js/CreateTables.sql`)
  console.log(`Loaded CreateTables into ${mysqlDbName}`)
}

async function startTangerineToMySQL(pathToStateFile) {
  try {
    const cmd = `python3 /tangerine/server/src/modules/mysql/TangerineToMySQL.py ${pathToStateFile}`
    // const script = spawn(`python3`, ['/tangerine/server/src/modules/mysql/TangerineToMySQL.py', pathToStateFile])
    const args = ['/tangerine/server/src/modules/mysql/TangerineToMySQL.py', pathToStateFile]
    const script = spawn(`python3`, args)
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

const generateFlatResponse = async function (formResponse, locationList, sanitized) {
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
    complete: formResponse.complete
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

async function pushResponse(doc, db, connection) {
  // return new Promise((resolve, reject) => {
    // If there are any objects/arrays in the flatResponse, stringify them. Also make all property names lowercase to avoid duplicate column names (example: ID and id are different in python/js, but the same for MySQL leading attempting to create duplicate column names of id and ID).
    if (doc.data && typeof doc.data === 'object') {
      doc.data = Object.keys(doc.data).reduce((acc, key) => {
        return {
          ...acc,
          ...key === ''
            ? {}
            : {
                [key.toLowerCase()]: typeof doc.data[key] === 'object'
                  ? JSON.stringify(doc.data[key])
                  : doc.data[key]
              }
        }
      }, {})
    }
  switch (doc.type) {
    case 'case':
      console.log("case, doc: " + JSON.stringify(doc))
      const sql = `INSERT INTO case ('CaseID','formId','formTitle','startUnixtime','buildId','buildChannel','deviceId','groupId','complete','screen_id','status','ga_conception_date','ga_type','firstname','surname','participant_id','village','phone','nextvstdt','nextvstevt','caseDefinitionId','dbRevision','collection','startDatetime','uploadDatetime','numinf') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE CaseID = VALUES(CaseID), formId = VALUES(formId), formTitle = VALUES(formTitle), startUnixtime = VALUES(startUnixtime), buildId = VALUES(buildId), buildChannel = VALUES(buildChannel),deviceId = VALUES(deviceId),groupId= VALUES(groupId),complete= VALUES(complete),screen_id= VALUES(screen_id),status= VALUES(status),ga_conception_date= VALUES(ga_conception_date),ga_type= VALUES(ga_type),firstname= VALUES(firstname),surname= VALUES(surname),participant_id= VALUES(participant_id),village= VALUES(village),phone= VALUES(phone),nextvstdt= VALUES(nextvstdt),nextvstevt= VALUES(nextvstevt),caseDefinitionId= VALUES(caseDefinitionId),dbRevision= VALUES(dbRevision),collection= VALUES(collection),startDatetime= VALUES(startDatetime),uploadDatetime= VALUES(uploadDatetime),numinf= VALUES(numinf)`;
      const params = [
        doc._id,
        doc.formid,
        doc.formtitle,
        doc.startUnixtime,
        doc.buildId,
        doc.buildChannel,
        doc.deviceId,
        doc.groupId,
        doc.complete,
        doc.screen_id,
        doc.status,
        doc.ga_conception_date,
        doc.ga_type,
        doc.firstname,
        doc.surname,
        doc.participant_id,
        doc.village,
        doc.phone,
        doc.nextvstdt,
        doc.nextvstevt,
        doc.caseDefinitionId,
        doc.dbRevision,
        doc.collection,
        doc.startDatetime,
        doc.uploadDatetime,
        doc.numinf
      ]
      console.log("case, sql: " + sql)
      console.log("case, params: " + JSON.stringify(params))
      // await connection.execute(
      //   sql,
      //   params,
      //   function (err, results, fields) {
      //     console.log(results); // results contains rows returned by server
      //     console.log(fields); // fields contains extra meta data about results, if available
      //
      //     // If you execute same statement again, it will be picked from a LRU cache
      //     // which will save query preparation time and give better performance
      //   }
      // );
      try {
        const [results, fields] = await connection.execute(sql, params);
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
      } catch (e) {
        console.log("error inserting case: " + e)
      }
      
      break;
    case 'participant':
      console.log("participant, doc: " + JSON.stringify(doc))
      break;
    case 'event-form':
      console.log("event-form, doc: " + JSON.stringify(doc))
      break;
    default:
      console.log("formResponse or issue " + doc.type + " doc: " + JSON.stringify(doc))
      break;
  }
  // })
}

async function sendToMysql(connection, doc) {
  console.log("Sending to mysql, doc: " + JSON.stringify(doc))
}

async function saveFlatResponse(doc, locationList, targetDb, sanitized, connection) {
  let flatResponse = await generateFlatResponse(doc, locationList, sanitized);
  // If there are any objects/arrays in the flatResponse, stringify them. Also make all property names lowercase to avoid duplicate column names (example: ID and id are different in python/js, but the same for MySQL leading attempting to create duplicate column names of id and ID).
  flatResponse = Object.keys(flatResponse).reduce((acc, key) => {
    return {
      ...acc,
      ...key === ''
        ? {}
        : {
            [key.toLowerCase()]: typeof flatResponse[key] === 'object'
              ? JSON.stringify(flatResponse[key])
              : flatResponse[key]
          }
    }
  }, {})
  // make sure the top-level properties of doc are copied.
  const topDoc = {}
  Object.entries(doc).forEach(([key, value]) => value === Object(value) ? null : topDoc[key] = value);
  await pushResponse({...topDoc,
    data: flatResponse
  }, targetDb, connection);
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