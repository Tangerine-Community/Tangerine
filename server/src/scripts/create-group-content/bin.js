#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Set group content after test data replication.')
  console.log('A local content set is any directory found in the /tangerine/content-sets/ directory.')
  console.log('Usage:')
  console.log('       create-group-content <group-id> <groupName>')
  console.log('')
  console.log('Examples:')
  console.log('       create-group-content "abc-123-xyz" "CM-test-1')

  process.exit()
}

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs-extra')

async function createGroupContent() {
  const serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
  const groupLabel = process.argv[3]
  const groupId = process.argv[2]

  const contentSet = '/tangerine/content-sets/case-module'
  const groupPath = '/tangerine/groups/' + groupId
  const tmpGroupPath = '/.' + groupId

  // Get the contents into the temporary group path.
  await exec(`cp -r ${contentSet} ${tmpGroupPath}`)

  // @TODO Create a symlink to the old group client directory until all the other APIs are updated and we have
  // a proper upgrade script to migrate group directories.
  await exec(`ln -s ${groupPath}/client /tangerine/client/content/groups/${groupId}`)

  // Detect if content-set v1 or content-set v2.
  let contentSetVersion
  if (await fs.exists(`${tmpGroupPath}/app-config.json_example`)) {
    contentSetVersion = 1
  } else if (await fs.exists(`${tmpGroupPath}/client/app-config.defaults.json`)) {
    contentSetVersion = 2
  } else {
    console.log('Could not detect valid content set')
    exec(`rm -rf ${tmpGroupPath}`)
  }
  // Set up the group content directory.
  if (contentSetVersion === 1) {
    await exec(`mkdir ${groupPath}`)
    await exec(`mkdir ${groupPath}/editor`)
    await exec(`mv ${tmpGroupPath} ${groupPath}/client`)
  } else if (contentSetVersion === 2) {
    await exec(`mv ${tmpGroupPath} ${groupPath}`)
  }

  // Set up the app-config.json
  let appConfigPath = `${groupPath}/client/app-config.json`
  let appConfigDefaultsPath
  if (contentSetVersion === 1) {
    appConfigDefaultsPath = `${groupPath}/client/app-config.json_example`
  } else if (contentSetVersion === 2) {
    appConfigDefaultsPath = `${groupPath}/client/app-config.defaults.json`
  }
  const appConfig = await fs.readJson(appConfigDefaultsPath)
  await fs.writeJson(appConfigPath, {
    ...appConfig,
    groupId,
    groupName: groupLabel,
    serverUrl
  })
}

createGroupContent()