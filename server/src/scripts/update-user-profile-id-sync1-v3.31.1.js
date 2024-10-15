#!/usr/bin/env node

/* 
 * This script changes the location of the user profile id and tablet user name in responses.
 * The userProfileId and tabletUserName were stored as inputs in the first item of the form.
 * They are now stored as top level properties of the response.
 */

const DB = require(`../db.js`)
const groupsList = require('/tangerine/server/src/groups-list.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./update-user-profile-id-sync1-v3.31.1.js')
  process.exit()
}

Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};

async function go() {
  const groupNames = await groupsList()
  // let prodDbs = {}
  // let reportingDbs = {}
  for (let groupName of groupNames) {
    let reportingDbSize;
    let prodDbSize;
    let diffs;
    let duration;
    console.log(`Processing ${groupName}`)
    // if (groupName !== 'tusome') {
    const prodDb = DB(`${groupName}`)
    let docs = [];
    try {
      const allDocs = await prodDb.get(`_all_docs`)
      // console.log("check out these docs: " + JSON.stringify(allDocs))
      for (let doc of allDocs.rows) {
        let docId = doc.id;
        docs.push(docId)

        if (doc.collection == "TangyFormResponse") {
          let response = await prodDb.get(docId)
          if (response.form.id === 'user-profile') {
            continue
          }
          let userProfileId = response.items[0].inputs.find(input => input.name === 'userProfileId')
          let tabletUserName = response.items[0].inputs.find(input => input.name === 'tabletUserName')
          if (userProfileId) {
            response.userProfileId = userProfileId.value
            response.items[0].inputs = response.items[0].inputs.filter(input => input.name !== 'userProfileId')
          }
          if (tabletUserName) {
            response.tabletUserName = tabletUserName.value
            response.items[0].inputs = response.items[0].inputs.filter(input => input.name !== 'tabletUserName')
          }
          await prodDb.put(response)
        }
      }
    } catch (err) {
      console.log("error: " + err)
    }

    console.log(groupName + " prod: " + prodDbSize + " reporting: " + reportingDbSize)
  }
}

go()