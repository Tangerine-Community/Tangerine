#!/usr/bin/env node
console.log('bar')

const fs = require('fs-extra')
const path = require('path')
const groupsList = require('/tangerine/server/src/groups-list.js')
const insertGroupReportingViews = require(`../insert-group-reporting-views.js`)
const DB = require(`../db.js`)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js')
  process.exit()
}

async function go() {
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    const db = DB(`${groupName}-reporting`)
    await db.destroy()
    await insertGroupReportingViews(groupName)
  }
  // update woerk state
  fs.readFile('/worker-state.json', 'utf-8', function(err, contents) {
      console.log(Object.keys(JSON.parse(contents)))
      const state = JSON.parse(contents)
      const newState = Object.assign({}, state, {
          databases: state.databases.map(({name, sequence}) => { return {name, sequence: 0}})
      })
      console.log(newState)
      fs.writeFile('/worker-state.json', JSON.stringify(newState), 'utf-8', function(err) {
        process.exit(0)
      })

  })

  
}
go()
