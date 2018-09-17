/* jshint esversion: 6 */

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const http = require('axios');
const read = require('read-yaml')
const express = require('express')
var session = require("express-session")
const PouchSession = require("session-pouchdb-store")
const bodyParser = require('body-parser');
const path = require('path')
const app = express()
const fs = require('fs-extra')
const fsc = require('fs')
const readFile = util.promisify(fsc.readFile);
const writeFile = util.promisify(fsc.writeFile);
const sanitize = require('sanitize-filename');
const cheerio = require('cheerio');
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'));
const pako = require('pako')
const compression = require('compression')
const chalk = require('chalk');
const generateCSV = require('../server/reporting/generate_csv').generateCSV;
const pretty = require('pretty')
const flatten = require('flat')
const json2csv = require('json2csv')
const bcrypt = require('bcryptjs');
const _ = require('underscore')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
// Place a groupName in this array and between runs of the reporting worker it will be added to the worker's state. 
var newGroupQueue = []
const insertGroupViews = require(`./src/insert-group-views.js`)
const insertGroupReportingViews = require('./src/insert-group-reporting-views')
const DB = require('./src/db.js')
const USERS_DB = new DB('users');
const requestLogger = require('./middlewares/requestLogger');
let crypto = require('crypto');
const junk = require('junk');
const cors = require('cors')
const sep = path.sep;

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

// COUCHDB endpoint proxy
if (process.env.T_COUCHDB_ENABLE === 'true') {
  // proxy for couchdb
  var proxy = require('express-http-proxy');
  var couchProxy = proxy(process.env.T_COUCHDB_ENDPOINT, {
    proxyReqPathResolver: function (req, res) {
      var path = require('url').parse(req.url).path;
      clog("path:" + path);
      return path;
    }
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
}

// Enable CORS
app.use(cors({
  credentials: true,
}));
app.options('*', cors()) // include before other routes

/*
 * Auth
 */
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// This determines wether or not a login is valid.
passport.use(new LocalStrategy(
  async function (username, password, done) {
    if (await areCredentialsValid(username, password)) {
      log.info(`${username} login success`)
      return done(null, {
        name: username
      });
    } else {
      log.info(`${username} login fail`)
      return done(null, false, { message: 'Incorrect username or password' })
    }
  }
));
async function findUserByUsername(username) {
  const result = await USERS_DB.find({ selector: { username } });
  return result.docs[0];
}
async function areCredentialsValid(username, password) {
  try {
    let isValid = false;
    if (username == process.env.T_USER1 && password == process.env.T_USER1_PASSWORD) {
      isValid = true;
      return isValid;
    } else {
      if (await doesUserExist(username)) {
        const data = await findUserByUsername(username);
        const hashedPassword = data.password;
        isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
      }
      else { return isValid; }
    }
  } catch (error) {
    return false;
  }
}
// This decides what identifying piece of information to put in a cookie for the session.
passport.serializeUser(function (user, done) {
  done(null, user.name);
});

// This transforms the id in the session cookie to pass to req.user object.
passport.deserializeUser(function (id, done) {
  done(null, { name: id });
});


// Use sessions.
app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: new PouchSession(new DB('sessions'))
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1gb' }))
app.use(bodyParser.text({ limit: '1gb' }))
app.use(compression())
app.use(passport.initialize());
app.use(passport.session());

// Middleware to protect routes.
var isAuthenticated = require('./src/middleware/is-authenticated.js')
var hasUploadToken = require('./src/middleware/has-upload-token.js')

// Login service.
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.send({ name: req.user.name, statusCode: 200, statusMessage: 'ok' });
  }
);

// API
app.post('/api/:groupId/upload-check', hasUploadToken, require('./src/routes/group-upload-check.js'))
app.post('/api/:groupId/upload', hasUploadToken, require('./src/routes/group-upload.js'))
app.get('/api/:groupId/responses/:limit?/:skip?', isAuthenticated, require('./src/routes/group-responses.js'))
app.get('/api/:groupId/responsesByFormId/:formId/:limit?/:skip?', isAuthenticated, require('./src/routes/group-responses-by-form-id.js'))
// Note that the lack of security middleware here is intentional. User IDs are UUIDs and thus sufficiently hard to guess.
app.get('/api/:groupId/responsesByUserProfileId/:userProfileId/:limit?/:skip?', require('./src/routes/group-responses-by-user-profile-id.js'))
app.get('/api/:groupId/:docId', isAuthenticated, require('./src/routes/group-doc-read.js'))
app.put('/api/:groupId/:docId', isAuthenticated, require('./src/routes/group-doc-write.js'))
app.post('/api/:groupId/:docId', isAuthenticated, require('./src/routes/group-doc-write.js'))
app.delete('/api/:groupId/:docId', isAuthenticated, require('./src/routes/group-doc-delete.js'))
if (process.env.T_LEGACY === "true") {
  app.post('/upload/:groupName', require('./src/routes/group-upload.js'))
}

// Static assets.
app.use('/editor', express.static(path.join(__dirname, '../client/tangy-forms/editor')));
app.use('/', express.static(path.join(__dirname, '../editor/dist')));
app.use('/app/:group/', express.static(path.join(__dirname, '../editor/dist')));
app.use('/app/:group/assets', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/groups/' + req.params.group
  clog("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});

app.use('/editor/groups', isAuthenticated, express.static(path.join(__dirname, '../client/content/groups')));
app.use('/editor/:group/ckeditor/', express.static(path.join(__dirname, '../editor/src/ckeditor/')));
app.use('/ckeditor', express.static(path.join(__dirname, '../editor/src/ckeditor')));
app.use('/editor/assets/', express.static(path.join(__dirname, '../client/content/assets/')));
app.use('/client/content/assets/', express.static(path.join(__dirname, '../client/content/assets/')));
app.use('/csv/', express.static('/csv/'));

app.use('/releases/', express.static(path.join(__dirname, '../client/releases')))
app.use('/client/', express.static(path.join(__dirname, '../client/builds/dev')))

app.use('/editor/:group/content/assets', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/assets'
  clog("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});
app.use('/editor/:group/content', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/groups/' + req.params.group
  clog("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});

app.use('/editor/release-apk/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  const cmd = `cd /tangerine/server/src/scripts && ./release-apk.sh ${group} /tangerine/client/content/groups/${group} ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_HOST_NAME} 2>&1 | tee -a /apk.log`
  log.info("in release-apk, group: " + group + " releaseType: " + releaseType + `The command: ${cmd}`)
  try {
    await exec(cmd)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }

})

app.use('/editor/release-pwa/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  clog("in release-pwa, group: " + group + " releaseType: " + releaseType)
  try {
    await exec(`cd /tangerine/server/src/scripts && \
        ./release-pwa.sh ${group} /tangerine/client/content/groups/${group} ${releaseType}
  `)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

app.use('/editor/release-dat/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  clog("in release-pwa, group: " + group + " releaseType: " + releaseType)
  try {
    const status = await exec(`cd /tangerine/client && \
        ./release-dat.sh ${group} /tangerine/client/content/groups/${group} ${releaseType}
    `)
    // Clean up whitespace.
    const datArchiveUrl = status.stdout.replace('\u001b[?25l','')
    res.send({ statusCode: 200, datArchiveUrl })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

app.get('/users', isAuthenticated, async (req, res) => {
  const result = await USERS_DB.allDocs({ include_docs: true });
  const data = result.rows
    .map((doc) => doc)
    .filter((doc) => !doc['id'].startsWith('_design'))
    .map((doc) => {
      const user = doc['doc'];
      return { _id: user._id, username: user.username, email: user.email };
    });
  res.send({ statusCode: 200, data });
});

app.get('/users/userExists/:username', isAuthenticated, async (req, res) => {
  let data;
  let statusCode;
  try {
    data = await doesUserExist(req.params.username);
    if (!data) {
      statusCode = 200;
    } else {
      statusCode = 409;
    }
    res.send({ statusCode, data: !!data });
  } catch (error) {
    statusCode = 500;
    res.send({ statusCode, data: true }); // In case of error assume user exists. Helps avoid same username used multiple times
  }

});

async function doesUserExist(username) {
  try {
    if (await isSuperAdmin(username)) {
      return true;
    } else {
      await USERS_DB.createIndex({ index: { fields: ['username'] } });
      const data = await findUserByUsername(username);
      return data && data.username && data.username.length > 0;
    }

  } catch (error) {
    console.error(error);
    return true; // In case of error assume user exists. Helps avoid same username used multiple times
  }
}

app.post('/users/register-user', isAuthenticated, async (req, res) => {
  try {
    if (!(await doesUserExist(req.body.username))) {
      const user = req.body;
      user.password = await hashPassword(user.password);
      user.groups = [];
      const data = await USERS_DB.post(user);
      res.send({ statusCode: 200, data });
      return data;
    }
  } catch (error) {
    console.log(error);
    return false; // @TODO return meaningful error
  }
});

app.get('/users/byUsername/:username', isAuthenticated, async (req, res) => {
  const username = req.params.username;
  try {
    await USERS_DB.createIndex({ index: { fields: ['username'] } });
    const results = await USERS_DB.find({ selector: { username: { '$regex': `(?i)${username}` } } });
    const data = results.docs.map(username => username.username)
    res.send({ data, statusCode: 200, statusMessage: 'Ok' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/users/isSuperAdminUser/:username', isAuthenticated, async (req, res) => {
  try {
    const data = await isSuperAdmin(req.params.username);
    res.send({ data, statusCode: 200, statusMessage: 'ok' })
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/users/isAdminUser/:username', isAuthenticated, async (req, res) => {
  try {
    const data = await isAdminUser(req.params.username);
    res.send({ data, statusCode: 200, statusMessage: 'ok' })
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
}

app.post('/editor/file/save', isAuthenticated, async function (req, res) {
  const filePath = req.body.filePath
  const groupId = req.body.groupId
  const fileContents = req.body.fileContents
  const actualFilePath = `/tangerine/client/content/groups/${groupId}/${filePath}`
  await fs.outputFile(actualFilePath, fileContents)
  res.send({status: 'ok'})
  // ok
})

app.delete('/editor/file/save', isAuthenticated, async function (req, res) {
  const filePath = req.query.filePath
  const groupId = req.query.groupId
  clog(req.params)
  clog(req.param)
  if (filePath && groupId) {
    const actualFilePath = `/tangerine/client/content/groups/${groupId}/${filePath}`
    await fs.remove(actualFilePath)
    res.send({status: 'ok'})
  } else {
    res.sendStatus(500)
  }
})

/**
 * Sets up files and directories for a group:
 * Creates content, qa, and prod dirs for the group; seeds qa with Cordova project.
 * Edits app-config.json.
 * Creates cordova-hcp.json and copies to qa dir.
 * Creates Results Database for the corresponding group
 * Inserts the design Doc into the results database
 * Sets up watching of the group DB to listen to the changes feed on the database
 * Redirects user to editor page for the group.
 */
app.post('/editor/group/new', isAuthenticated, async function (req, res) {

  // See if this instance supports the class module, copy the class forms, and set homeUrl
  let homeUrl;
  let syncProtocol;
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
        syncProtocol = "replication"
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
    appConfig.uploadUrl = `${process.env.T_PROTOCOL}://${process.env.T_UPLOAD_USER}:${process.env.T_UPLOAD_PASSWORD}@${process.env.T_HOST_NAME}/upload/${groupName}`
    appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
    appConfig.groupName = groupName
    appConfig.registrationRequiresServerUser = (process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true') ? true : false
    if (typeof homeUrl !== 'undefined') {
      appConfig.homeUrl = homeUrl
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

  //#region wire group DB and result db

  /**
   * Instantiate the results database. A method call on the database creates the database if database doesnt exist.
   * Also create the design doc for the resultsDB
   */
  await insertGroupReportingViews(groupName)

  // The keepReportingWorkerAlive function finds groups this way and adds them to the worker.
  newGroupQueue.push(groupName)

  // Set up watching of groupDb for changes.
  //#endregion

  // All done!
  res.send({ data: 'Group Created Successfully', statusCode: 200 });
})

app.get('/groups', isAuthenticated, async function (req, res) {

  try {
    const groups = await getGroupsByUser(req.user.name);
    res.send(groups);
  } catch (error) {
    res.sendStatus(500)
  }
})

async function getGroupsByUser(username) {
  if (await isSuperAdmin(username)) {
    const readdirPromisified = util.promisify(fs.readdir)
    const files = await readdirPromisified('/tangerine/client/content/groups');
    let filteredFiles = files.filter(junk.not).filter(name => name !== '.git' && name !== 'README.md')
    let groups = [];
    clog('/groups route lists these dirs: ' + filteredFiles)

    groups = filteredFiles.map((groupName) => {
      return {
        attributes: {
          name: groupName,
          role: 'admin'
        }
      }
    })
    return groups;
  } else {
    const user = await findUserByUsername(username);
    let groups = [];
    if (typeof user.groups !== 'undefined') {
      groups = user.groups.map(group => {
        return {
          attributes: {
            name: group.groupName,
            role: group.role
          }
        }
      });
    }
    return groups;
  }
}
async function isSuperAdmin(username) {
  return username === process.env.T_USER1;
}

// If is not admin, return false else return the list of the groups to which user isAdmin
async function isAdminUser(username) {
  try {
    const groups = await getGroupsByUser(username);
    const data = groups.filter(group => group.attributes.role === 'admin');
    if (data.length < 1) {
      data = false;
    }
    return data;
  }
  catch (error) {
    return false;
    console.log(error)
  }
}
app.post('/groups/:groupName/addUserToGroup', isAuthenticated, async (req, res) => {
  const payload = req.body;
  const groupName = req.params.groupName;
  try {
    const user = await findUserByUsername(payload.username)
    /**
     *  If the groups array is existent on the user object, check if the is already in the groups array i.e. it is being updated
     *    If it exists, update the role, otherwise add a new record to the groups array and save.
     * 
     * If the groups array is non existent on the user object, assign the groups array with the corresponding groupname and role
     * This is needful especially for users created before role management was added.
     * 
     */
    if (typeof user.groups !== 'undefined') {
      const index = user.groups.findIndex(group => group.groupName === groupName);
      if (index > -1) {
        user.groups[index] = { groupName, role: payload.role }
      } else {
        user.groups.push({ groupName, role: payload.role })
      }
    } else {
      user.groups = [{ groupName, role: payload.role }];
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


// TODO Notify caller if group doesnt have form response, to avoid infinite polling  
app.get('/csv/:groupName/:formId', async function (req, res) {
  const groupName = sanitize(req.params.groupName)
  const formId = sanitize(req.params.formId)
  const fileName = `${groupName}-${formId}-${Date.now()}.csv`
  const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
  const outputPath = `/csv/${fileName}`
  const cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${groupName} ${formId} ${outputPath} ${batchSize}`
  log.info(`generating csv start: ${cmd}`)
  exec(cmd).then(status => {
    log.info(`generate csv done: ${JSON.stringify(status)}`)
  }).catch(error => {
    log.error(error)
  })
  res.send({
    stateUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.csv', '.state.json')}`,
    downloadUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  })
})

/* @TODO This is not complete. The generate-csv script needs to be updated to support this.
app.get('/csv/byPeriodAndFormId/:groupName/:formId/:year?/:month?', isAuthenticated, (req, res) => {
  const groupName = req.params.groupName;
  const year = req.params.year;
  const month = req.params.month;
  const formId = req.params.formId;
  const groupReportingDbName = groupName + '-reporting';

  generateCSV(formId, groupReportingDbName, res);
});
*/




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
  const CONTENT_PATH = '../client/content/groups/'
  const groups = getDirectories(CONTENT_PATH)
  return groups.map(group => group.trim()).filter(groupName => groupName !== '.git')
}

const keepAliveReportingWorker = async initialGroups => {
  try {
    // Populate worker-state.json if there any initialGroups not currently being watched.
    let workerState = JSON.parse(await readFile('/worker-state.json', 'utf-8'))
    if (!workerState.databases) workerState.databases = []
    for (let groupName of initialGroups) {
      let feed = workerState.databases.find(database => database.name === groupName)
      if (!feed) workerState.databases.push({ name: groupName, sequence: 0 })
    }
    var pouchDbDefaults = {}
    if (process.env.T_COUCHDB_ENABLE === 'true') {
      pouchDbDefaults = { prefix: process.env.T_COUCHDB_ENDPOINT }
    } else {
      pouchDbDefaults = { prefix: '/tangerine/db/' }
    }
    workerState.pouchDbDefaults = pouchDbDefaults
    await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
    // Declare variables now so they don't have to be delared continuously and garbage collected later.
    let response = {
      stdout: '',
      stderr: ''
    }
    // Keep alive.
    while (true) {
      // Hook in and add a new group if it is queued.
      while (newGroupQueue.length > 0) {
        workerState = JSON.parse(await readFile('/worker-state.json', 'utf-8'))
        workerState.databases.push({ name: newGroupQueue.pop(), sequence: 0 })
        await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
      }
      // Run the worker.
      try {
        response = await exec('cat /worker-state.json | /tangerine/server/reporting/run-worker.js');
        if (typeof response.stderr === 'object') {
          log.error(`run-worker.js STDERR: ${JSON.stringify(response.stderr)}`)
        } else if (response.stderr) {
          log.error(`run-worker.js STDERR: ${response.stderr}`)
        }
        try {
          workerState = JSON.parse(response.stdout)
          await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
          // Wrap up. If nothing was last processed, sleep for 30 seconds.
          if (workerState.processed === 0) {
            log.info('No changes processed. Sleeping...')
            await sleep(30 * 1000)
          } else {
            log.info(`Processed ${workerState.processed} changes.`)
          }
        } catch (error) {
          log.error(error)
          log.info('keepAliveReportingWorker had an error trying to save state. Sleeping for 30 seconds.')
          await sleep(30*1000)
        }
      } catch (error) {
        log.error(error)
        log.info('keepAliveReportingWorker had an error. Sleeping for 30 seconds.')
        await sleep(30*1000)
      }
    }
  } catch (error) {
    log.error(error)
    console.log(error)
    log.info('keepAliveReportingWorker had an error. Sleeping for 30 seconds.')
    await sleep(30*1000)

  }
}
const initialGroups = allGroups()
keepAliveReportingWorker(initialGroups)

async function getTin() {
  const db = new DB('tintin')
  let result = {}
  try {
    result = await db.query('byFormId', {'key': 'example'})
  } catch(err) {
    clog(err)
  }
  clog(result)
}
//getTin()


// Start the server.
var server = app.listen('80', function () {
  var host = server.address().address;
  var port = server.address().port;
  log.info(server.address());
  log.info('Server V3: http://%s:%s', host, port);
});
