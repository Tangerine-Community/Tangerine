const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const insertGroupViews = require(`../insert-group-views.js`)
const insertGroupReportingViews = require('../insert-group-reporting-views.js')
const fs = require('fs-extra')

const util = require('util');
const exec = util.promisify(require('child_process').exec)

module.exports = async (req, res) => {

  // See if this instance supports the class module, copy the class forms, and set homeUrl
  let homeUrl;
  let syncProtocol;
  let uploadUnlockedFormReponses;
  let modules = [];
  let modulesString = process.env.T_MODULES;
  modulesString = modulesString.replace(/'/g, '"');
  let moduleEntries = JSON.parse(modulesString)
  if (moduleEntries.length > 0) {
    for (let moduleEntry of moduleEntries) {
      modules.push(moduleEntry);
      if (moduleEntry === "class") {
        clog("Setting homeUrl to dashboard")
        homeUrl =  "dashboard"
        uploadUnlockedFormReponses =  true
        // copy the class forms
        const exists = await fs.pathExists('/tangerine/client/app/src/assets/class-registration')
        if (!exists) {
          try {
            await fs.copy('/tangerine/scripts/modules/class/', '/tangerine/client/app/src/assets/')
            console.log('Copied class module forms.')
          } catch (err) {
            console.error(err)
          }
        }
      } else {
        clog("moduleEntry: " + moduleEntry)
      }
    }
  }
  let groupName = req.body.groupName
  // Copy the content directory for the new group.
  await exec(`cp -r /tangerine/client/app/src/assets  /tangerine/client/content/groups/${groupName}`)
  await insertGroupViews(groupName, DB)
  // Edit the app-config.json.
  try {
    appConfig = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, "utf8"))
    appConfig.uploadToken = process.env.T_UPLOAD_TOKEN 
    appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
    appConfig.groupName = groupName
    appConfig.hideProfile = (process.env.T_HIDE_PROFILE === 'true') ? true : false 
    appConfig.registrationRequiresServerUser = (process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true') ? true : false
    if (typeof homeUrl !== 'undefined') {
      appConfig.homeUrl = homeUrl
    }
    if (typeof uploadUnlockedFormReponses !== 'undefined') {
      appConfig.uploadUnlockedFormReponses = uploadUnlockedFormReponses
    }
    if (typeof syncProtocol !== 'undefined') {
      appConfig.syncProtocol = syncProtocol
      appConfig.uploadUrl = `${process.env.T_PROTOCOL}://${process.env.T_UPLOAD_USER}:${process.env.T_UPLOAD_PASSWORD}@${process.env.T_SYNC_SERVER}/${groupName}`
    }
    if (modules.length > 0) {
      appConfig.modules = modules;
    }
    appConfig.direction = `${process.env.T_LANG_DIRECTION}`
    if (process.env.T_CATEGORIES) {
      let categoriesString = `${process.env.T_CATEGORIES}`
      categoriesString = categoriesString.replace(/'/g, '"');
      let categoriesEntries = JSON.parse(categoriesString)
      appConfig.categories = categoriesEntries;
    }
  } catch (err) {
    log.error("An error reading app-config: " + err)
    throw err;
  }
  await fs.writeFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, JSON.stringify(appConfig))
    .then(status => log.info("Wrote app-config.json"))
    .catch(err => log.error("An error copying app-config: " + err))
  // Create a blank location-list.
  await fs.writeFile(`/tangerine/client/content/groups/${groupName}/location-list.json`, JSON.stringify({
    "locationsLevels": [],
    "locations": {},
    "metadata": {}
  }))

  // Create reporting DB and views.
  await insertGroupReportingViews(groupName)

  // All done!
  res.send({ data: 'Group Created Successfully', statusCode: 200 });
}