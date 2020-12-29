/* jshint esversion: 6 */

const util = require('util');
const exec = util.promisify(require('child_process').exec)
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
const cheerio = require('cheerio');
const PouchDB = require('pouchdb')
const pouchRepStream = require('pouchdb-replication-stream');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(pouchRepStream.plugin);
PouchDB.adapter('writableStream', pouchRepStream.adapters.writableStream);
const pako = require('pako')
const compression = require('compression')
const chalk = require('chalk');
const pretty = require('pretty')
const flatten = require('flat')
const json2csv = require('json2csv')
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
const tangyModules = require('./modules/index.js')()
const { extendSession, findUserByUsername,
   USERS_DB, login, getSitewidePermissionsByUsername,
   updateUserSiteWidePermissions, getUserGroupPermissionsByGroupName, addRoleToGroup, findRoleByName, getAllRoles, updateRoleInGroup} = require('./auth');
const {registerUser,  getUserByUsername, isUserSuperAdmin, isUserAnAdminUser, getGroupsByUser, deleteUser,
   getAllUsers, checkIfUserExistByUsername, findOneUserByUsername,
   findMyUser, updateUser, restoreUser, updateMyUser} = require('./users');
 const {saveResponse: saveSurveyResponse, publishSurvey, unpublishSurvey} = require('./online-survey')
log.info('heartbeat')
setInterval(() => log.info('heartbeat'), 5*60*1000)
const cookieParser = require('cookie-parser');
const { getPermissionsList } = require('./permissions-list.js');
const repStream = require('express-pouchdb-replication-stream');
const PACKAGENAME = "org.rti.tangerine"
const APPNAME = "Tangerine"

module.exports = async function expressAppBootstrap(app) {

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

// Enable CORS
app.use(cors({
  credentials: true,
}));
app.options('*', cors()) // include before other routes
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1gb' }))
app.use(bodyParser.text({ limit: '1gb' }))
app.use(compression())
// Middleware to protect routes.
var isAuthenticated = require('./middleware/is-authenticated.js')
var {permit, permitOnGroupIfAll} = require('./middleware/permitted.js')
var hasUploadToken = require('./middleware/has-upload-token.js')
var hasSurveyUploadKey = require('./middleware/has-online-survey-upload-key')
var isAuthenticatedOrHasUploadToken = require('./middleware/is-authenticated-or-has-upload-token.js')

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
 * Online survey routes
 */

app.post('/onlineSurvey/publish/:groupId/:formId', isAuthenticated, publishSurvey);
app.put('/onlineSurvey/unpublish/:groupId/:formId', isAuthenticated, unpublishSurvey);
app.post('/onlineSurvey/saveResponse/:groupId/:formId', hasSurveyUploadKey, saveSurveyResponse);
/*
 * More API
 */

app.get('/api/modules', isAuthenticated, require('./routes/modules.js'))
app.post('/api/:groupId/upload-check', hasUploadToken, require('./routes/group-upload-check.js'))
app.post('/api/:groupId/upload', hasUploadToken, require('./routes/group-upload.js'))
app.get('/api/:groupId/responses/:limit?/:skip?', isAuthenticated, require('./routes/group-responses.js'))
app.get('/api/:groupId/responsesByFormId/:formId/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-form-id.js'))
app.get('/api/:groupId/responsesByMonthAndFormId/:keys/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-month-and-form-id.js'))
// Support for API working with group pathed cookie :). We should do this for others because our group cookies can't access /api/.
app.get('/app/:groupId/responsesByMonthAndFormId/:keys/:limit?/:skip?', isAuthenticated, require('./routes/group-responses-by-month-and-form-id.js'))

// Note that the lack of security middleware here is intentional. User IDs are UUIDs and thus sufficiently hard to guess.
app.get('/api/:groupId/responsesByUserProfileId/:userProfileId/:limit?/:skip?', require('./routes/group-responses-by-user-profile-id.js'))
app.get('/api/:groupId/responsesByUserProfileShortCode/:userProfileShortCode/:limit?/:skip?', require('./routes/group-responses-by-user-profile-short-code.js'))
app.get('/api/:groupId/:docId', isAuthenticatedOrHasUploadToken, require('./routes/group-doc-read.js'))
app.put('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-write.js'))
app.post('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-write.js'))
app.delete('/api/:groupId/:docId', isAuthenticated, require('./routes/group-doc-delete.js'))
if (process.env.T_LEGACY === "true") {
  app.post('/upload/:groupId', require('./routes/group-upload.js'))
}
app.get('/api/csv/:groupId/:formId', isAuthenticated, require('./routes/group-csv.js'))
app.get('/api/csv/:groupId/:formId/:year/:month', isAuthenticated, require('./routes/group-csv.js'))
app.get('/api/csv-sanitized/:groupId/:formId', isAuthenticated, require('./routes/group-csv.js'))
app.get('/api/csv-sanitized/:groupId/:formId/:year/:month', isAuthenticated, require('./routes/group-csv.js'))
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
// @TODO Need isAdminUser middleware.
app.use('/app/:group/media-upload', isAuthenticated, upload.any(), require('./routes/group-media-upload.js'));
app.use('/app/:group/media-delete', isAuthenticated, require('./routes/group-media-delete.js'));
app.use('/app/:group/assets', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/client`
  return express.static(contentPath).apply(this, arguments);
});
app.use('/app/:group/files', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/`
  return express.static(contentPath).apply(this, arguments);
});

app.use('/csv/', express.static('/csv/'));

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

app.use('/editor/release-apk/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  const config = JSON.parse(await fs.readFile(`/tangerine/groups/${group}/client/app-config.json`, "utf8"));
  const packageName = config.packageName? config.packageName: PACKAGENAME
  const appName = config.appName ? config.appName: APPNAME
  const cmd = `cd /tangerine/server/src/scripts && ./release-apk.sh ${group} /tangerine/groups/${group}/client ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_HOST_NAME} ${packageName} "${appName}" 2>&1 | tee -a /apk.log`
  log.info("in release-apk, group: " + group + " releaseType: " + releaseType + ` The command: ${cmd}`)
  // Do not await. The browser just needs to know the process has started and will monitor the status file.
  exec(cmd).catch(log.error)
  res.send({ statusCode: 200, data: 'ok' })
})

app.use('/editor/release-pwa/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  try {
    const cmd = `release-pwa ${group} /tangerine/groups/${group}/client ${releaseType}`
    log.info("in release-pws, group: " + group + " releaseType: " + releaseType + ` The command: ${cmd}`)
    log.info(`RELEASING PWA: ${cmd}`)
    await exec(cmd)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

app.use('/editor/release-online-survey-app/:groupId/:formId/:releaseType/:appName/:uploadKey/', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const groupId = sanitize(req.params.groupId)
  const formId = sanitize(req.params.formId)
  const releaseType = sanitize(req.params.releaseType)
  const appName = sanitize(req.params.appName)
  const uploadKey = sanitize(req.params.uploadKey)

  try {
    const cmd = `release-online-survey-app ${groupId} ${formId} ${releaseType} "${appName}" ${uploadKey} `
    log.info(`RELEASING Online survey app: ${cmd}`)
    await exec(cmd)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

app.use('/editor/unrelease-online-survey-app/:groupId/:formId/:releaseType/', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const groupId = sanitize(req.params.groupId)
  const formId = sanitize(req.params.formId)
  const releaseType = sanitize(req.params.releaseType)
  try {
    const cmd = `rm -rf /tangerine/client/releases/${releaseType}/online-survey-apps/${groupId}/${formId}`
    log.info(`UNRELEASING Online survey app: ${cmd}`)
    await exec(cmd)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

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

app.use('/api/sync/:groupId/:deviceId/:syncUsername/:syncPassword', async function(req, res, next){
  const groupId = req.params.groupId;
  const deviceId = req.params.deviceId;
  const syncUsername = req.params.syncUsername;
  const syncPassword = req.params.syncPassword;
  const url = `http://${syncUsername}:${syncPassword}@couchdb:5984/${groupId}`
  const devicesUrl = `http://${syncUsername}:${syncPassword}@couchdb:5984/${groupId}-devices`
  console.log("about to repStream to " + groupId + " deviceId: " + deviceId + " syncUsername: " + syncUsername + " syncPassword: " + syncPassword + " using devicesUrl: " + devicesUrl)
  const groupDevicesDb = await new PouchDB(devicesUrl)
  const device = await groupDevicesDb.get(deviceId)
  // const device = await groupDevicesDb.allDocs({include_docs:true})
  // console.log("device: " + JSON.stringify(device))
  let syncLocation = device.syncLocations[0]
  let locationSetting = syncLocation.value.slice(-1).pop()
  let location = {
    [`${locationSetting.level}`]: locationSetting.value
  }
  let locationString = JSON.stringify(location)
  console.log("location: " + locationString)
  // const formInfos = await this.tangyFormsInfoService.getFormsInfo()
  let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
  let ids = forms.map(formInfo => {
    if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
      return formInfo.id
    }
  })
  // console.log("ids: " + JSON.stringify(ids))
  const replicationOpts = { filter : `
      const locTest =  doc.location["${locationSetting.level}"] === "${locationSetting.value}"
      const idTest = ${ids}.find(id  => {
        // console.log("id: " + id + " doc.form.id: " + doc.form.id)
        if (id === doc.form.id) {
          return true
        }
      })
      const responseTest = doc.collection === 'TangyFormResponse'
      console.log("locTest: " + locTest + " idTest: " + idTest + " responseTest: " + responseTest)
      return locTest && idTest && responseTest
      // return doc.collection === 'TangyFormResponse';
    }}
    `
  // console.log("replicationOpts: " + replicationOpts.filter.toString())

  // stream db to express response
  const db = new PouchDB(url);
  const dump =  db.dump(res, replicationOpts)
    .catch(function(err){
      // custom error handler
      if(typeof config.error === 'function'){
        return config.error(err);
      }
      res.status(500).send(err);
    });
  // console.log("dump" + dump)
  return dump
});


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

const runPaidWorker = require('./paid-worker')
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
