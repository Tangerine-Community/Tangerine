#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('')
  console.log('Usage:')
  console.log('       output-conflict-revs <groupId> <participantId> <action>')
  process.exit()
}

const axios = require('axios')
const fs = require('fs-extra')
// const PouchDB = require('pouchdb')
// PouchDB.plugin(require('pouchdb-find'))
const DB = require('../../db.js')

const groupId = process.argv[2];
let participantId = process.argv[3];
let action = process.argv[4];
if (!action) {
  action = 'downloadRevs'
}
const db = DB(groupId)
// const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}`)
// const groupPath = '/tangerine/client/content/groups/' + groupId


async function getUser1HttpInterface() {
  const body = await axios.post('https://talky.ngrok.io/login', {
    username: process.env.T_USER1,
    password: process.env.T_USER1_PASSWORD
  })
  const token = body['data']['data']['token']
  let http = axios.create({
    headers: {
      authorization: token
    },
    baseUrl: 'https://talky.ngrok.io'
  })
  return http
}

async function downloadRevs() {
  let caseId
  try {
    const http = await getUser1HttpInterface()
    const searchDocs = (await http.post(`/group-responses/search/${groupId}`, {phrase: participantId}))['data']
    if (searchDocs.length > 0) {
      caseId =  searchDocs[0]._id
      console.log("caseId: " + caseId)
      // const info = await db.info()
      // console.log("db info: " + JSON.stringify(info))
      // const view = `_design/issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId/_view/issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId?reduce=false&startkey=[%22case%22,%22${caseId}%22,%220%22,%220%22]&endkey=[%22case%22,%22${caseId}%22,{},{}]`
      const view = `issuesOfTypeConflictByConflictingDocTypeAndRevsAndConflictingDocId`
      console.log("view: " + view)
      const options = {
        reduce: false,
        startkey: ['case',caseId,'0','0'],
        endkey: ['case',caseId,{},{}],
        include_docs: true
      }
      console.log("options: " + JSON.stringify(options))
      const results  = await db.query(view, options)
      if (results && results.rows.length > 0) {
        const participantDir = `/tangerine/groups/${groupId}/${participantId}`
        await fs.ensureDir(participantDir)
        for (const result of results.rows) {
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
      }
      
      // console.log("results: " + JSON.stringify(results))
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

