#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js')
  process.exit()
}

/**
 * @function`getDirectories` returns an array of strings of the top level directories found in the path supplied
 * @param {string} srcPath The path to the directory
 */
const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.lstatSync(path.join(srcPath, file)).isDirectory())

/**
 * Gets the list of all the existing groups from the content folder
 * Listens for the changes feed on each of the group's database
 */
function allGroups() {
  const CONTENT_PATH = '/tangerine/client/content/groups/'
  const groups = getDirectories(CONTENT_PATH)
  return groups.map(group => group.trim()).filter(groupName => groupName !== '.git')
}

const insertGroupViews = require(`../insert-group-views.js`)
const DB = require(`../db.js`)
async function go() {
  for (let groupName of allGroups()) {
    await insertGroupViews(groupName, DB)
  }
}
go()
