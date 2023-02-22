
/* jshint esversion: 6 */


const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
// const fs = require('fs-extra')
const compression = require('compression')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
// const multer = require('multer')
// const upload = multer({ dest: '/tmp-uploads/' })
// Place a groupName in this array and between runs of the reporting worker it will be added to the worker's state. 
// var newGroupQueue = []
const cors = require('cors')
// const tangyModules = require('./modules/index.js')()
// const { extendSession, findUserByUsername,
//    USERS_DB, login, getSitewidePermissionsByUsername,
//    updateUserSiteWidePermissions, getUserGroupPermissionsByGroupName, addRoleToGroup, findRoleByName, getAllRoles, updateRoleInGroup, isSuperAdmin} = require('./auth');
// const {registerUser,  getUserByUsername, isUserSuperAdmin, isUserAnAdminUser, getGroupsByUser, deleteUser,
//    getAllUsers, checkIfUserExistByUsername, findOneUserByUsername,
//    findMyUser, updateUser, restoreUser, updateMyUser} = require('./users');
//  const {saveResponse: saveSurveyResponse, publishSurvey, unpublishSurvey} = require('./online-survey')
log.info('heartbeat')
setInterval(() => log.info('heartbeat'), 5*60*1000)
const cookieParser = require('cookie-parser');
// const { getPermissionsList } = require('./permissions-list.js');
const { releaseAPK, releasePWA, releaseOnlineSurveyApp, unreleaseOnlineSurveyApp, commitFilesToVersionControl } = require('./releases.js');
// const {archiveToDiskConfig, passwordPolicyConfig} = require('./config-utils.js')
// const { generateCSV, generateCSVDataSet, generateCSVDataSetsRoute, listCSVDataSets, getDatasetDetail } = require('./routes/group-csv.js');
// const allowIfUser1 = require('./middleware/allow-if-user1.js');

// if (process.env.T_AUTO_COMMIT === 'true') {
//   setInterval(commitFilesToVersionControl,parseInt(process.env.T_AUTO_COMMIT_FREQUENCY))
// }
module.exports = async function expressAppBootstrap(app) {

// Enable CORS
try {
  if (process.env.T_CORS_ALLOWED_ORIGINS) {
    const origin = JSON.parse(process.env.T_CORS_ALLOWED_ORIGINS)
    app.use(cors({
      credentials: true,
      origin
    }))
    log.info(`CORS enabled for origins: ${origin}`)
  } else {
    log.info('CORS is disabled')
  }
} catch(e) {
  log.error(`Error parsing T_CORS_ALLOWED_ORIGINS: ${process.env.T_CORS_ALLOWED_ORIGINS}`)
  console.log(e)
}

// Enforce SSL behind Load Balancers.
if (process.env.T_PROTOCOL == 'https') {
  app.use(function (req, res, next) {
    if (req.get('X-Forwarded-Proto') == 'http') {
      res.redirect('https://' + req.get('Host') + req.url);
    }
    else {
      next();
    }
  });
}

// Proxy for CouchDB
var proxy = require('express-http-proxy');
var couchProxy = proxy(process.env.T_COUCHDB_ENDPOINT, {
  proxyReqPathResolver: function (req, res) {
    var path = require('url').parse(req.url).path;
    // clog("path:" + path);
    return path;
  },
  limit: '1gb'
});
var mountpoint = '/db';
app.use(mountpoint, couchProxy);
app.use(mountpoint, function (req, res) {
  if (req.originalUrl === mountpoint) {
    res.redirect(301, req.originalUrl + '/');
  } else {
    couchProxy;
  }
});
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1gb' }))
app.use(bodyParser.text({ limit: '1gb' }))
app.use(compression())
// Middleware to protect routes.
// var isAuthenticated = require('./middleware/is-authenticated.js')
// var {permit, permitOnGroupIfAll} = require('./middleware/permitted.js')
// var hasUploadToken = require('./middleware/has-upload-token.js')
// var hasDeviceOrUploadToken = require('./middleware/has-device-token-or-has-upload-token.js')
// var hasSurveyUploadKey = require('./middleware/has-online-survey-upload-key')
// var isAuthenticatedOrHasUploadToken = require('./middleware/is-authenticated-or-has-upload-token.js')

app.get('/version',
  function (req, res) {
    res.send(process.env.T_VERSION);
  }
)

/**
 * Online survey routes
 */

// app.post('/onlineSurvey/publish/:groupId/:formId', isAuthenticated, publishSurvey);
// app.put('/onlineSurvey/unpublish/:groupId/:formId', isAuthenticated, unpublishSurvey);
// app.post('/onlineSurvey/saveResponse/:groupId/:formId', hasSurveyUploadKey, saveSurveyResponse);

// app.post('/apk-generator/release-apk/:group', isAuthenticated, releaseAPK)
app.post('/apk-generator/release-apk/:group', releaseAPK)

// app.post('/apk-generator/release-pwa/:group/', isAuthenticated, releasePWA)
app.post('/apk-generator/release-pwa/:group/', releasePWA)

// app.use('/apk-generator/release-online-survey-app/:groupId/:formId/:releaseType/:appName/:uploadKey/', isAuthenticated, releaseOnlineSurveyApp)
app.use('/apk-generator/release-online-survey-app/:groupId/:formId/:releaseType/:appName/:uploadKey/', releaseOnlineSurveyApp)

// app.use('/apk-generator/unrelease-online-survey-app/:groupId/:formId/:releaseType/', isAuthenticated, unreleaseOnlineSurveyApp)
app.use('/apk-generator/unrelease-online-survey-app/:groupId/:formId/:releaseType/', unreleaseOnlineSurveyApp)




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
  const CONTENT_PATH = '/tangerine/groups/'
  const groups = getDirectories(CONTENT_PATH)
  return groups.map(group => group.trim()).filter(groupName => groupName !== '.git')
}


// await tangyModules.hook('declareAppRoutes', {app})

}
