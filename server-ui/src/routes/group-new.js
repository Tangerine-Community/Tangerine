const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const insertGroupViews = require(`../insert-group-views.js`)
const insertGroupReportingViews = require('../insert-group-reporting-views.js')
const fs = require('fs-extra')
const tangyModules = require('../modules/index.js')()

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
      clog("moduleEntry: " + moduleEntry)
    }
  }
  let groupName = req.body.groupName
  // Copy the content directory for the new group.
  await exec(`cp -r /tangerine/client/src/assets  /tangerine/client/content/groups/${groupName}`)
  await insertGroupViews(groupName, DB)
  // Edit the app-config.json.
  try {
    appConfig = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, "utf8"))
    appConfig.uploadToken = process.env.T_UPLOAD_TOKEN 
    appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
    appConfig.groupName = groupName
    appConfig.hideProfile = (process.env.T_HIDE_PROFILE === 'true') ? true : false 
    appConfig.registrationRequiresServerUser = (process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true') ? true : false
    appConfig.centrallyManagedUserProfile = (process.env.T_CENTRALLY_MANAGED_USER_PROFILE === 'true') ? true : false
    appConfig.mediaFileStorageLocation = 'file'
    if (modules.length > 0) {
      appConfig.modules = modules;
    }
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
  const data = await tangyModules.hook('groupNew', {groupName, appConfig})
  appConfig = data.appConfig
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
