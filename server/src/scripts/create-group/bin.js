#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Create a group given a label and an optional content set.'
  console.log('A local content set is any directory found in the /tangerine/content-sets/ directory.')
  console.log('Usage:')
  console.log('       create-group <label> [contentSet]')
  console.log('')
  console.log('Examples:')
  console.log('       create-group "New Group A"')
  console.log('       create-group "New Group B" case-module')
  console.log('       create-group "New Group C" https://github.com/rjsteinert/tangerine-content-set-test.git')
  process.exit()
}

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra')
const axios = require('axios')

async function getUser1HttpInterface() {
  const body = await axios.post('http://localhost/login', {
    username: process.env.T_USER1,
    password: process.env.T_USER1_PASSWORD
  })
  const token = body['data']['data']['token']
  let http = axios.create({
    headers: {
      authorization: token 
    },
    baseUrl: 'http://localhost'
  })
  return http
}

async function createGroup() {
  const http = await getUser1HttpInterface()
  const serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}`
  const groupLabel = process.argv[2]
  const group = (await http.post('/nest/group/create', {label: groupLabel}))['data']
  console.log('Created group:')
  console.log(group)
  if (process.argv[3]) {
    const contentSet = process.argv[3].includes('.git')
      ? process.argv[3]
      : `/tangerine/content-sets/${process.argv[3]}`
    const groupId = group._id
    const groupPath = '/tangerine/client/content/groups/' + groupId
    await exec(`rm -r ${groupPath}`)
    await exec(`${contentSet.includes('.git') ? `git clone ` : `cp -r `} ${contentSet} ${groupPath}`)
    const appConfig = await fs.readJson(`${groupPath}/app-config.json_example`)
    await fs.writeJson(`${groupPath}/app-config.json`, {
      ...appConfig,
      groupId,
      groupName: groupLabel,
      serverUrl
    })
  }
}

createGroup()