/* jshint esversion: 6 */

const util = require('util');
const http = require('axios');
const read = require('read-yaml')
const express = require('express')
var session = require("express-session")
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs-extra')
const pathExists = require('fs-extra').pathExists
const fsc = require('fs')
const readFile = util.promisify(fsc.readFile);
const writeFile = util.promisify(fsc.writeFile);
const unlink = util.promisify(fsc.unlink)
const sanitize = require('sanitize-filename');
const PouchDB = require('pouchdb')
const pouchRepStream = require('pouchdb-replication-stream');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(pouchRepStream.plugin);
PouchDB.adapter('writableStream', pouchRepStream.adapters.writableStream);
const compression = require('compression')
const _ = require('underscore')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const multer = require('multer')
const upload = multer({ dest: '/tmp-uploads/' })
// Place a groupName in this array and between runs of the reporting worker it will be added to the worker's state. 
var newGroupQueue = []
let crypto = require('crypto');
const junk = require('junk');
const cors = require('cors')
const sep = path.sep;
const exec = util.promisify(require('child_process').exec)
const tangyModules = require('./modules/index.js')()
const { extendSession, findUserByUsername,
   USERS_DB, login, getSitewidePermissionsByUsername,
   updateUserSiteWidePermissions, getUserGroupPermissionsByGroupName, addRoleToGroup, findRoleByName, getAllRoles, updateRoleInGroup, isSuperAdmin} = require('./auth');
const {registerUser,  getUserByUsername, isUserSuperAdmin, isUserAnAdminUser, getGroupsByUser, deleteUser,
   getAllUsers, checkIfUserExistByUsername, findOneUserByUsername,
   findMyUser, updateUser, restoreUser, updateMyUser} = require('./users');
const {login: surveyLogin, saveResponse: saveSurveyResponse, publishSurvey, unpublishSurvey, getOnlineSurveys} = require('./online-survey')
const {
  getCaseDefinitions,
  getCaseDefinition,
  createCase,
  readCase,
  createCaseEvent,
  createEventForm,
  createParticipant,
  getCaseEventFormSurveyLinks
} = require('./case-api')
const { createUserProfile } = require('./user-profile')
log.info('heartbeat')
setInterval(() => log.info('heartbeat'), 5*60*1000)
const cookieParser = require('cookie-parser');
const MemoryStream = require("memorystream");
const { getPermissionsList } = require('./permissions-list.js');
const {AppContext} = require("../../editor/src/app/app-context.enum");
const PACKAGENAME = "org.rti.tangerine"
const APPNAME = "Tangerine"
const { releaseAPK, releasePWA, releaseOnlineSurveyApp, unreleaseOnlineSurveyApp, commitFilesToVersionControl } = require('./releases.js');
const {archiveToDiskConfig, passwordPolicyConfig} = require('./config-utils.js')
const { generateCSV, generateCSVDataSet, generateCSVDataSetsRoute, listCSVDataSets, getDatasetDetail } = require('./routes/group-csv.js');
const allowIfUser1 = require('./middleware/allow-if-user1.js');
const hasUploadToken = require("./middleware/has-upload-token");
const tangerineMySQLApi = require('./mysql-api/index.js');

if (process.env.T_AUTO_COMMIT === 'true') {
  setInterval(commitFilesToVersionControl,parseInt(process.env.T_AUTO_COMMIT_FREQUENCY))
}
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
var isAuthenticated = require('./middleware/is-authenticated.js')
var {permit, permitOnGroupIfAll} = require('./middleware/permitted.js')
var hasUploadToken = require('./middleware/has-upload-token.js')
var hasDeviceOrUploadToken = require('./middleware/has-device-token-or-has-upload-token.js')
var hasSurveyUploadKey = require('./middleware/has-online-survey-upload-key')
var isAuthenticatedOrHasUploadToken = require('./middleware/is-authenticated-or-has-upload-token.js')

app.get('/version',
  function (req, res) {
    res.send(process.env.T_VERSION);
  }
)

/*
 * Login and session API
 */

app.post('/login', login);
app.get('/login/validate/:userName',
  function (req, res) {
    if (req.user && (req.params.userName === req.user.name)) {
      res.send({ valid: true });
    } else {
      res.send({ valid: false });
    }
  }
);
app.post('/extendSession', isAuthenticated, extendSession);
app.get('/permissionsList', isAuthenticated, getPermissionsList);
app.get('/sitewidePermissionsByUsername/:username', 
          isAuthenticated, permit(['can_manage_users_site_wide_permissions']), getSitewidePermissionsByUsername);
app.post('/permissions/updateUserSitewidePermissions/:username', isAuthenticated, permit(['can_manage_users_site_wide_permissions']), updateUserSiteWidePermissions);

app.get('/custom-login-markup', (request, response) => response.send(process.env.T_CUSTOM_LOGIN_MARKUP || ''));

/*
 * User API
 */

app.get('/users', isAuthenticated, permit(['can_view_users_list']), getAllUsers);
app.get('/users/byUsername/:username', isAuthenticated, getUserByUsername);
app.get('/users/findOneUser/:username', isAuthenticated, findOneUserByUsername);
app.get('/users/findMyUser/', isAuthenticated, findMyUser);
app.put('/users/updateMyUser/', isAuthenticated, updateMyUser);
app.get('/users/userExists/:username', isAuthenticated, checkIfUserExistByUsername);
app.post('/users/register-user', isAuthenticated, permit(['can_create_users']), registerUser);
app.get('/users/isSuperAdminUser/:username', isAuthenticated, isUserSuperAdmin);
app.get('/users/isAdminUser/:username', isAuthenticated, isUserAnAdminUser);
app.patch('/users/restore/:username', isAuthenticated, permit(['can_edit_users']), restoreUser);
app.delete('/users/delete/:username', isAuthenticated, permit(['can_edit_users']), deleteUser);
app.put('/users/update/:username', isAuthenticated, permit(['can_edit_users']), updateUser);
app.get('/users/groupPermissionsByGroupName/:groupName', isAuthenticated, getUserGroupPermissionsByGroupName);
/**
 * Get Config value
 */

 app.get('/configuration/archiveToDisk', isAuthenticated, archiveToDiskConfig);
 app.get('/configuration/passwordPolicyConfig', isAuthenticated, passwordPolicyConfig);

/**
 * User Profile API Routes
 */

app.post('/userProfile/createUserProfile/:groupId', isAuthenticated, createUserProfile);

/**
 * Case API Routes
 */

app.get('/case/getCaseDefinitions/:groupId', isAuthenticated, getCaseDefinitions);
app.get('/case/getCaseDefinition/:groupId/:caseDefinitionId', isAuthenticated, getCaseDefinition);
app.post('/case/createCase/:groupId/:caseDefinitionId', isAuthenticated, createCase);
app.post('/case/readCase/:groupId/:caseId', isAuthenticated, readCase);
app.post('/case/createCaseEvent/:groupId/:caseId/:caseEventDefinitionId', isAuthenticated, createCaseEvent);
app.post('/case/createEventForm/:groupId/:caseId/:caseEventId/:caseEventFormDefinitionId', isAuthenticated, createEventForm);
app.post('/case/createParticipant/:groupId/:caseId/:caseDefinitionId/:caseRoleId', isAuthenticated, createParticipant);
app.get('/case/getCaseEventFormSurveyLinks/:groupId/:caseId', isAuthenticated, getCaseEventFormSurveyLinks);

/**
 * Online survey routes
 */

app.post('/onlineSurvey/login/:groupId/:accessCode', surveyLogin);
app.post('/onlineSurvey/publish/:groupId/:formId', isAuthenticated, publishSurvey);
app.put('/onlineSurvey/unpublish/:groupId/:formId', isAuthenticated, unpublishSurvey);
app.post('/onlineSurvey/saveResponse/:groupId/:formId', hasSurveyUploadKey, saveSurveyResponse);
app.get('/onlineSurvey/getOnlineSurveys/:groupId', isAuthenticated, getOnlineSurveys);

/*
 * More API
 */

app.get('/api/modules', isAuthenticated, require('./routes/modules.js'))
app.post('/api/:groupId/upload-check', hasUploadToken, require('./routes/group-upload-check.js'))
  if (process.env.T_UPLOAD_WITHOUT_UPDATING_REV === "false") {
    app.post('/api/:groupId/upload', hasUploadToken, require('./routes/group-upload.js'))
  } else {
    app.post('/api/:groupId/upload', hasUploadToken, require('./routes/group-upload-without-get-rev.js'))
  }
app.get('/api/:groupId/responses/:limit?/:skip?', isAuthenticated, require('./routes/group-responses.js'))
app.get('/app/:groupId/response-variable-value/:responseId/:variableName', isAuthenticated, require('./routes/group-response-variable-value.js'))
app.get('/api/:groupId/responsesByFormId/:formId/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-form-id.js'))
app.get('/api/:groupId/responsesByMonthAndFormId/:keys/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-month-and-form-id.js'))
app.get('/app/:groupId/docCountByLocationId/:locationId', isAuthenticated, require('./routes/group-doc-count-by-location-id.js'))
app.get('/app/:groupId/downSyncDocCountByLocationId/:locationId', isAuthenticated, require('./routes/group-down-sync-doc-count-by-location-id.js'))
// Support for API working with group pathed cookie :). We should do this for others because our group cookies can't access /api/.
app.get('/app/:groupId/responsesByMonthAndFormId/:keys/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-month-and-form-id.js'))

// Note that the lack of security middleware here is intentional. User IDs are UUIDs and thus sufficiently hard to guess.
app.get('/api/:groupId/responsesByUserProfileId/:userProfileId/:limit?/:skip?', require('./routes/group-responses-by-user-profile-id.js'))
app.get('/api/:groupId/responsesByUserProfileShortCode/:userProfileShortCode/:limit?/:skip?', require('./routes/group-responses-by-user-profile-short-code.js'))
app.get('/api/:groupId/userProfileByShortCode/:userProfileShortCode', require('./routes/group-user-profile-by-short-code.js'))
app.get('/api/:groupId/:docId', isAuthenticatedOrHasUploadToken, require('./routes/group-doc-read.js'))
app.put('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-write.js'))
app.post('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-write.js'))
app.delete('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-delete.js'))
if (process.env.T_LEGACY === "true") {
  app.post('/upload/:groupId', require('./routes/group-upload.js'))
}
app.get('/api/csv/:groupId/:formId', isAuthenticated, generateCSV)
app.get('/api/csv/:groupId/:formId/:year/:month', isAuthenticated, generateCSV)
app.get('/api/csv-sanitized/:groupId/:formId', isAuthenticated, generateCSV)
app.get('/api/csv-sanitized/:groupId/:formId/:year/:month', isAuthenticated, generateCSV)
app.post('/api/create/csvDataSet/:groupId', isAuthenticated, generateCSVDataSet)
app.get('/api/create/csvDataSets/:datasetsId', allowIfUser1, generateCSVDataSetsRoute)
app.post('/api/create/csvDataSet-sanitized/:groupId', isAuthenticated, generateCSVDataSet)
app.get('/apis/listCSVDatasets/:groupId/:pageIndex/:pageSize', isAuthenticated, listCSVDataSets)
app.get('/apis/CSVDatasetDetail/:datasetId', isAuthenticated, getDatasetDetail)

app.get('/api/usage', require('./routes/usage'));
// For backwards compatibility for older consumers of this API.
app.get('/usage', require('./routes/usage'));
app.get('/usage/:startdate', require('./routes/usage'));
app.get('/usage/:startdate/:enddate', require('./routes/usage'));

// Static assets.
app.use('/client', express.static('/tangerine/client/dev'));
app.use('/', express.static('/tangerine/editor/dist/tangerine-editor'));
app.use('/app/:group/', express.static('/tangerine/editor/dist/tangerine-editor'));
app.use('/app/:group/media-list', require('./routes/group-media-list.js'));
app.use('/app/:groupId/csv-headers/:formId', require('./routes/group-csv-headers.js'));
app.use('/app/:groupId/csv-templates/list', require('./routes/group-csv-templates-list.js'));
app.use('/app/:groupId/csv-templates/create', require('./routes/group-csv-templates-create.js'));
app.use('/app/:groupId/csv-templates/read/:templateId', require('./routes/group-csv-templates-read.js'));
app.use('/app/:groupId/csv-templates/update', require('./routes/group-csv-templates-update.js'));
app.use('/app/:groupId/csv-templates/delete/:templateId', require('./routes/group-csv-templates-delete.js'));
// @TODO Need isAdminUser middleware.
app.use('/app/:group/media-upload', isAuthenticated, upload.any(), require('./routes/group-media-upload.js'));
app.use('/app/:group/client-media-upload', hasDeviceOrUploadToken, upload.any(), require('./routes/group-client-upload.js'));
app.use('/app/:group/media-delete', isAuthenticated, require('./routes/group-media-delete.js'));
app.use('/app/:group/assets', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/client`
  return express.static(contentPath).apply(this, arguments);
});
app.use('/app/:group/files', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/`
  return express.static(contentPath).apply(this, arguments);
});


// Location List API
app.use('/app/:groupId/location-lists/read', require('./routes/group-location-lists-read.js'));

app.use('/app/:groupId/location-list/create', require('./routes/group-location-list-create.js'));
//app.use('/app/:groupId/location-list/read', require('./routes/group-location-list-read.js'));
app.use('/app/:groupId/location-list/update', require('./routes/group-location-list-update.js'));
app.use('/app/:groupId/location-list/delete', require('./routes/group-location-list-delete.js'));

app.use('/csv/', isAuthenticated, express.static('/csv/'));

app.use('/releases/', express.static('/tangerine/client/releases'))
app.use('/client/', express.static('/tangerine/client/builds/dev'))

app.use('/editor/:group/content/assets', isAuthenticated, function (req, res, next) {
  let contentPath = '/tangerine/client/content/assets'
  clog("Setting path to " + contentPath)
  return express.static(contentPath).apply(this, arguments);
});
app.use('/editor/:group/content', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/client`
  return express.static(contentPath).apply(this, arguments);
});

const queueNewGroupMiddleware = function (req, res, next) {
  newGroupQueue.push(req.body.groupName)
  next()
}

app.post('/editor/release-apk/:group', isAuthenticated, releaseAPK)

app.post('/editor/release-pwa/:group/', isAuthenticated, releasePWA)

// TODO @deprice: This route should be removed.
app.use('/editor/release-online-survey-app/:groupId/:formId/:releaseType/:appName/:uploadKey/', isAuthenticated, releaseOnlineSurveyApp)

app.post('/editor/release-online-survey-app/:groupId/:formId/:releaseType/:appName/', isAuthenticated, releaseOnlineSurveyApp)

app.use('/editor/unrelease-online-survey-app/:groupId/:formId/:releaseType/', isAuthenticated, unreleaseOnlineSurveyApp)

app.post('/editor/file/save', isAuthenticated, async function (req, res) {
  const filePath = req.body.filePath
  const groupId = req.body.groupId
  const fileContents = req.body.fileContents
  const actualFilePath = `/tangerine/groups/${groupId}/client/${filePath}`
  await fs.outputFile(actualFilePath, fileContents)
  res.send({status: 'ok'})
  // ok
})
  
app.delete('/editor/file/save', isAuthenticated, async function (req, res) {
  const filePath = req.query.filePath
  const groupId = req.query.groupId
  if (filePath && groupId) {
    const actualFilePath = `/tangerine/groups/${groupId}/client/${filePath}`
    await fs.remove(actualFilePath)
    res.send({status: 'ok'})
  } else {
    res.sendStatus(500)
  }
})

app.get('/groups', isAuthenticated, async function (req, res) {
  try {
    const groups = await getGroupsByUser(req.user.name);
    res.send(groups);
  } catch (error) {
    res.sendStatus(500)
  }
})

app.get('/groups/:username', isAuthenticated, async function (req, res) {
  const username = req.params.username;
  try {
    const groups = await getGroupsByUser(username);
    res.send(groups);
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post('/groups/:groupName/addUserToGroup', isAuthenticated, async (req, res) => {
  const payload = req.body;
  const groupName = req.params.groupName;
  try {
    const user = await findUserByUsername(payload.username)
    /**
     *  If the groups array is existent on the user object,
     * check if the is already in the groups array i.e. it is being updated
     * If it exists, update the roles, otherwise add a new record to the groups array and save.
     * If the groups array is non existent on the user object,
     *  assign the groups array with the corresponding groupname and roles
     * This is needful especially for users created before role management was added.
     */
    if (typeof user.groups !== 'undefined') {
      const index = user.groups.findIndex(group => group.groupName === groupName);
      if (index > -1) {
        user.groups[index] = { ...payload.role }
      } else {
        user.groups.push({ ...payload.role })
      }
    } else {
      user.groups = [{ ...payload.role }];
    }
    const data = await USERS_DB.put(user);
    res.send({ data, statusCode: 200, statusMessage: `User Added to Group ${groupName}` })

  } catch (error) {
    console.error('Could not Add user to Group')
    res.sendStatus(500)
  }
});

app.get('/groups/users/byGroup/:groupName', isAuthenticated, async (req, res) => {
  try {
    const groupName = req.params.groupName;
    // Mango search in Arrays, Documentation in : https://stackoverflow.com/questions/43892556/mango-search-in-arrays-couchdb
    await USERS_DB.createIndex({ index: { fields: ['groups[].groupName'] }, type: 'json' });
    const results = await USERS_DB.find({ selector: { 'groups': { $elemMatch: { groupName } } } });
    const data = results.docs.map(result => {
      return {
        _id: result._id,
        username: result.username,
        email: result.email,
        firstName: result.firstName,
        roles: result.groups.find(group => group.groupName === groupName).roles,
        lastName: result.lastName
      }
    });
    res.send({ data, statusCode: 200, statusMessage: 'ok' })
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

app.get('/groups/users/byGroupAndUsername/:groupName/:username', isAuthenticated, async (req, res) => {
  try {
    const groupName = req.params.groupName;
    const username = req.params.username;
    // Mango search in Arrays, Documentation in : https://stackoverflow.com/questions/43892556/mango-search-in-arrays-couchdb
    await USERS_DB.createIndex({ index: { fields: ['groups[].groupName'] }, type: 'json' });

    const results = await USERS_DB.find({
      selector: {
        groups: { $elemMatch: { groupName } },
        username: { '$regex': `(?i)${username}` }
      }
    });
    const data = results.docs.map(result => {
      return {
        _id: result._id,
        username: result.username,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
      }
    });
    res.send({ data, statusCode: 200, statusMessage: 'ok' })
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

app.patch('/groups/removeUserFromGroup/:groupName', isAuthenticated, async (req, res) => {
  try {
    const username = req.body.username;
    const groupName = req.params.groupName;
    const user = await findUserByUsername(username);
    if (user && user._id) {
      user.groups = user.groups.filter(group => group.groupName !== groupName);
      const data = await USERS_DB.put(user);
      res.send({ statusCode: 200, data, statusMessage: `User: ${username} removed from Group: ${groupName}` })
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

app.post('/permissions/addRoleToGroup/:groupId', 
          isAuthenticated, permitOnGroupIfAll(['can_manage_group_roles']), addRoleToGroup);

app.get('/rolesByGroupId/:groupId/role/:role', isAuthenticated, findRoleByName);
app.get('/rolesByGroupId/:groupId/roles', isAuthenticated, getAllRoles);
app.post('/permissions/updateRoleInGroup/:groupId', isAuthenticated, permitOnGroupIfAll(['can_manage_group_roles']), updateRoleInGroup);

app.use('/mysql-api', isAuthenticated, permitOnGroupIfAll(['can_access_mysql_api']), tangerineMySQLApi);

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

const runPaidWorker = require('./paid-worker.js')
async function keepAlivePaidWorker() {
  let state = {}
  while(true) {
    try {
      state = await runPaidWorker()
      if (state.batchMarkedPaid === 0) {
        //log.info('No responses marked as paid. Sleeping...')
        await sleep(10*1000)
      } else {
        log.info(`Marked ${state.batchMarkedPaid} responses as paid.`)
      }
    } catch (error) {
      log.error(error.message)
      console.log(error)
      await sleep(10*1000)
    }
  }
}
keepAlivePaidWorker()

await tangyModules.hook('declareAppRoutes', {app})

}
