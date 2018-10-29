#!/usr/bin/env node

const DB = require(`../db.js`)
const groupsList = require('/tangerine/server/src/groups-list.js')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./find-missing-records.js')
  process.exit()
}

Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};

async function go() {
  const groupNames = await groupsList()
  debugger;
  // let prodDbs = {}
  // let reportingDbs = {}
  for (let groupName of groupNames) {
    let reportingDbSize;
    let prodDbSize;
    let diffs;
    let duration;
    console.log(`Processing ${groupName}` )
    // if (groupName !== 'tusome') {
    const prodDb = DB(`${groupName}`)
    let docs = [];
    try {
      const allDocs = await prodDb.get(`_all_docs`)
      // console.log("check out these docs: " + JSON.stringify(allDocs))
      for (let doc of allDocs.rows) {
        let docId = doc.id;
        docs.push(docId)
      }
      // prodDbs[groupName] = docs
    } catch (err) {
      console.log("error: " + err)
    }

    // add an array of docs to reportingDbs object
    const reportingDb = DB(`${groupName}-reporting`)
    // console.log(`${groupName}-reporting` )
    let reports = [];
    try {
      const allDocs = await reportingDb.get(`_all_docs`)
      // console.log("check out these docs: " + JSON.stringify(allDocs))
      for (let doc of allDocs.rows) {
        // console.log(groupName + " doc: " + JSON.stringify(doc))
        let docId = doc.id;
        reports.push(docId)
      }
      // reportingDbs[groupName] = reports
    } catch (err) {
      console.log("error: " + err)
    }

    // now output sizes

    if (docs)
      prodDbSize = docs.length

    if (reports)
      reportingDbSize = reports.length

    console.log(groupName + " prod: " + prodDbSize + " reporting: " + reportingDbSize)

    function diff(A, B) {
      return A.filter(function (a) {
        if (!a.startsWith('_design')) {
          // return B.indexOf(a) == -1;
          return !B.includes(a);
        }
      });
    }

    if (docs && reports) {
      let startTime = Math.round(new Date() / 1000);
      diffs = diff(docs, reports)
      let endTime = Math.round(new Date() / 1000);
      duration = endTime - startTime
    }
    console.log("Duration: " + duration + " seconds to calculate the diffs for " + groupName + ": " + JSON.stringify(diffs))
    // }
  }
  // // now output sizes
  // for (let groupName of groupNames) {
  //   let reportingDbSize;
  //   let prodDbSize;
  //   let diffs;
  //   let duration;
  //
  //   let reportingDb = reportingDbs[groupName];
  //   if (reportingDb)
  //    reportingDbSize = reportingDb.length
  //
  //   let prodDb = prodDbs[groupName];
  //   if (prodDb)
  //    prodDbSize = prodDb.length
  //   console.log(groupName + " prod: " + prodDbSize + " reporting: " +  reportingDbSize)
  //   function diff(A, B) {
  //     return A.filter(function (a) {
  //       if (!a.startsWith('_design')) {
  //         // console.log("a: " + a)
  //         // return B.indexOf(a) == -1;
  //         return !B.includes(a);
  //       }
  //     });
  //   }
  //
  //   if (prodDb && reportingDb) {
  //     let startTime = Math.round(new Date() / 1000);
  //     diffs =diff(prodDb, reportingDb)
  //     let endTime = Math.round(new Date() / 1000);
  //     duration = endTime - startTime
  //   }
  //
  //   console.log("Duration: " + duration + " seconds to calculate the diffs for " + groupName + ": " + JSON.stringify(diffs))
  // }
}

go()