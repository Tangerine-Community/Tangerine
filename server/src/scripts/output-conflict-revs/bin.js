#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('')
  console.log('Usage:')
  console.log('Default action is downloadRevs.')
  console.log('dbUrl is for external urls.')
  console.log('       output-conflict-revs <groupId> <participantId> <action> <dbUrl> <username> <password> <appUrl> <appUsername> <appPassword> <localAppUrl> ')
  process.exit()
}

const axios = require('axios')
const fs = require('fs-extra')
// PouchDB.plugin(require('pouchdb-find'))
// const DB = require('../../db.js')
const PouchDB = require('pouchdb')
const jwt_decode = require('jwt-decode')

const groupId = process.argv[2];
const participantId = process.argv[3];
let action = process.argv[4];
const dbUrl = process.argv[5];
const username = process.argv[6];
const password = process.argv[7];
const appUrl = process.argv[8];
const appUsername = process.argv[9];
const appPassword = process.argv[10];
let localAppUrl = process.argv[11];
let dbName;
if (dbUrl) {
  // dbName = `${dbUrl}/${groupId}`
  dbName = groupId
} else {
  dbName = groupId
}
if (!action) {
  action = 'downloadRevs'
}

let searchUrl = `${localAppUrl}/group-responses/search/${groupId}`
if (appUrl) {
  searchUrl = `${appUrl}/group-responses/search/${groupId}`
}
if (!localAppUrl) {
  localAppUrl = `https://talky.ngrok.io/`
}

let options = {timeout: 50000, skip_setup: true}
if (dbUrl) {
  options.prefix = dbUrl
}
if (username) {
  if (!options.auth) {
    options.auth = {}
  }
  options.auth.username = username
}
if (password) {
  if (!options.auth) {
    options.auth = {}
  }
  options.auth.password = password
}
// const prefix = { prefix: process.env.T_COUCHDB_ENDPOINT }
// const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
// console.log("dbName: " + dbName + " options: " + JSON.stringify(options))
const db = PouchDB(dbName, options)

// const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)
// const groupPath = '/tangerine/client/content/groups/' + groupId


async function getUser1HttpInterface() {
  let body
  if (appUrl) {
    body = await axios.post(`${appUrl}/login`, {
      username: appUsername,
      password: appPassword
    })
  } else {
    body = await axios.post(`${localAppUrl}/login`, {
      username: process.env.T_USER1,
      password: process.env.T_USER1_PASSWORD
    })
  }
  const token = body['data']['data']['token']
  let options = {
    headers: {
      authorization: token
    },
    baseUrl: `${localAppUrl}`
  }

  if (appUrl) {
    options.baseUrl = `${appUrl}`
  }
  
  let http = axios.create(options)
  return http
}

async function getDbHttpInterface() {
  let body
  if (appUrl) {
    body = await axios.post(`${dBUrl}/login`, {
      username: dBUsername,
      password: appPassword
    })
  } else {
    body = await axios.post(`${localAppUrl}/login`, {
      username: process.env.T_USER1,
      password: process.env.T_USER1_PASSWORD
    })
  }
  const token = body['data']['data']['token']
  let options = {
    headers: {
      authorization: token
    },
    baseUrl: `${localAppUrl}`
  }

  if (appUrl) {
    options.baseUrl = `${appUrl}`
  }
  
  let http = axios.create(options)
  return http
}

async function getPermissionsForGroup(http) {
  let data
  if (appUrl) {
    data = await http.get(`${appUrl}/users/groupPermissionsByGroupName/${groupId}`)
  } else {
    data = await http.get(`${localAppUrl}/users/groupPermissionsByGroupName/${groupId}`)
  }
  // const token = body['data']['data']['token']
  // turtles all the way down.
  const token = data.data.data.token
  // console.log("token: " + JSON.stringify(token))
  let options = {
    headers: {
      authorization: token
    }
  }

  if (appUrl) {
    options.baseUrl = `${appUrl}`
  } else {
    options.baseUrl = `${localAppUrl}`
  }
  // console.log("options: " + JSON.stringify(options))
  let http2 = axios.create(options)

  return http2
}

async function downloadRevs() {
  console.log("dbUrl: " + dbUrl + " searchUrl: " + searchUrl + " participantId: " + participantId)
  let caseId
  try {
    const http1 = await getUser1HttpInterface()
    const http = await getPermissionsForGroup(http1)
    // if (http.status === 200) {
    //   const token = http.data.data.token
    //   console.log("token: " + JSON.stringify(token))
    //   // await setTokens(token);
    //   // return true;
    // }
    const searchDocs = (await http.post(`${searchUrl}`, {phrase: participantId}))['data']
    // console.log("searchDocs: " + JSON.stringify(searchDocs))

    if (searchDocs.length > 0) {
      caseId =  searchDocs[0]._id
      console.log("caseId: " + caseId)
      // const info = await db.info()
      // console.log("db info: " + JSON.stringify(info))

      let currentDoc;
      const participantDir = `/tangerine/groups/${groupId}/${participantId}`
      await fs.ensureDir(participantDir)
      // Download the most recent doc:
      currentDoc  = await db.get(`${caseId}`, {conflicts: true})
      let data = JSON.stringify(currentDoc, null, 2);
      // console.log("currentDoc data: " + data)
      const currentDocPath = participantDir + "/" + currentDoc._rev + ".json"
      fs.writeFileSync(currentDocPath, data);
      if (currentDoc._conflicts) {
        console.log("There are conflicts.")
        for (const conflictRev of currentDoc._conflicts) {
          console.log("conflictRev: " + conflictRev)
          const rev  = await db.get(`${caseId}`, {rev: conflictRev})
          let data = JSON.stringify(rev, null, 2);
          const revPath = participantDir + "/" + rev._rev + ".json"
          fs.writeFileSync(revPath, data);
          console.log("Wrote " + revPath)
        }
      } else {
        console.log("There are NO conflicts.")
      }

      // const view = `_design/issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId/_view/issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId?reduce=false&startkey=[%22case%22,%22${caseId}%22,%220%22,%220%22]&endkey=[%22case%22,%22${caseId}%22,{},{}]`
      const view = `issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId`
      console.log("view: " + view)
      const options = {
        reduce: false,
        startkey: ['case',caseId,'0','0'],
        endkey: ['case',caseId,{},{}],
        include_docs: true
      }
      // console.log("options: " + JSON.stringify(options))
      const results  = await db.query(view, options)
      // console.log("results: " + JSON.stringify(results))
      
      if (results && results.rows.length > 0) {
        // Download the revs:
        for (const result of results.rows) {
          console.log("issueId: " + result.id)
          const aDoc = result.doc.events[0].data.conflict.mergeInfo.diffInfo.a
          const bDoc = result.doc.events[0].data.conflict.mergeInfo.diffInfo.b
          let data = JSON.stringify(aDoc, null, 2);
          const aDocPath = participantDir + "/" + aDoc._rev + ".json"
          fs.writeFileSync(aDocPath, data);
          data = JSON.stringify(bDoc, null, 2);
          const bDocPath = participantDir + "/" + bDoc._rev + ".json"
          fs.writeFileSync(bDocPath, data);
          console.log("Wrote " + aDocPath + " and " + bDocPath)
        }
      } else {
        console.log("No conflict issues for this caseId. ")
      }
      // console.log("results: " + JSON.stringify(results))
    } else {
      console.log("Unable to find this patient. ")
    }
    // console.log("searchDocs: " + JSON.stringify(searchDocs))
  } catch (e) {
    console.log("Error! " + console.log(e))
  }

}

async function go() {
  
  console.log('Processing revs for action: ' + action)
  if (action === 'downloadRevs') {
    await downloadRevs()
  }
}
try {
  go().then(r => console.log("ok"))
} catch(e) {
  console.log(e)
}

