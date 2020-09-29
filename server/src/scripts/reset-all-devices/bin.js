#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       reset-all-devices <groupId>')
  process.exit()
}

const fs = require('fs-extra')
const PouchDB = require('pouchdb')
const {v4: uuid}= require('uuid')
const groupId = process.argv[2];
const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}-devices`)

async function go() {
 const devices = (await db.allDocs({include_docs:true}))
   .rows
   .map(row => {
     return {
       ...row.doc,
       claimed: false,
       token: uuid(),
       key: uuid()
     }
   })
  for (const device of devices) {
    await db.put(device)
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
