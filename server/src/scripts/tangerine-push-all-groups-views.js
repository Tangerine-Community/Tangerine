#!/usr/bin/env node
console.log('yam')
const fs = require('fs-extra')
const path = require('path')
const groupsList = require('/tangerine/server/src/groups-list.js')
const insertGroupViews = require(`../insert-group-views.js`)
const DB = require(`../db.js`)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js')
  process.exit()
}

async function go() {
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    await insertGroupViews(groupName, DB)
  }
}
go()
