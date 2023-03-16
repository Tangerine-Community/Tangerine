/* jshint esversion: 6 */

const express = require('express')
// const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs-extra')
const compression = require('compression')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
// const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
// Place a groupName in this array and between runs of the reporting worker it will be added to the worker's state. 
var newGroupQueue = []
const cors = require('cors')
log.info('server-ui heartbeat')
setInterval(() => log.info('server-ui heartbeat'), 5*60*1000)
const cookieParser = require('cookie-parser');
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

app.use(cookieParser())
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json({ limit: '1gb' }))
// app.use(bodyParser.text({ limit: '1gb' }))
app.use(compression())
// Middleware to protect routes.
var isAuthenticated = require('./middleware/is-authenticated.js')
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



// Static assets.
app.use('/client', express.static('/tangerine/client/dev'));
// app.use('/', express.static('/tangerine/editor/dist/tangerine-editor'));
  app.use('/', function (req, res, next) {
    // console.log("server assets: " + req.url)
    const params = JSON.stringify(req.params)
    console.log("server-ui route: / : " + params + " req.url: " + req.url + " req.originalUrl: " + req.originalUrl)
    return express.static('/tangerine/editor/dist/tangerine-editor').apply(this, arguments);
  });
  // app.use('/app/:group/', express.static('/tangerine/editor/dist/tangerine-editor'));
  app.use('/app/:group/', function (req, res, next) {
    const params = JSON.stringify(req.params)
    console.log("server-ui route: /app/:group/ : " + params + " req.url: " + req.url + " req.originalUrl: " + req.originalUrl)
    return express.static('/tangerine/editor/dist/tangerine-editor').apply(this, arguments);
  });
  app.use('/app/:group/assets/', function (req, res, next) {
    const params = JSON.stringify(req.params)
    console.log("server-ui route: /app/:group/assets : " + params + " req.url: " + req.url + " req.originalUrl: " + req.originalUrl)
    let contentPath = `/tangerine/groups/${req.params.group}/client`
    return express.static(contentPath).apply(this, arguments);
  });
// app.use('/app/:group/media-list', require('./routes/group-media-list.js'));
// app.use('/app/:groupId/csv-headers/:formId', require('./routes/group-csv-headers.js'));
// app.use('/app/:groupId/csv-templates/list', require('./routes/group-csv-templates-list.js'));
// app.use('/app/:groupId/csv-templates/create', require('./routes/group-csv-templates-create.js'));
// app.use('/app/:groupId/csv-templates/read/:templateId', require('./routes/group-csv-templates-read.js'));
// app.use('/app/:groupId/csv-templates/update', require('./routes/group-csv-templates-update.js'));
// app.use('/app/:groupId/csv-templates/delete/:templateId', require('./routes/group-csv-templates-delete.js'));
// // @TODO Need isAdminUser middleware.
// app.use('/app/:group/media-upload', isAuthenticated, upload.any(), require('./routes/group-media-upload.js'));
// app.use('/app/:group/client-media-upload', hasDeviceOrUploadToken, upload.any(), require('./routes/group-client-upload.js'));
// app.use('/app/:group/media-delete', isAuthenticated, require('./routes/group-media-delete.js'));
// app.use('/app/:group/assets', isAuthenticated, function (req, res, next) {
// app.use('/app/:group/assets', function (req, res, next) {
//   console.log("server-ui assets: " + req.url)
//   let contentPath = `/tangerine/groups/${req.params.group}/client`
//   return express.static(contentPath).apply(this, arguments);
// });
app.use('/app/:group/files', isAuthenticated, function (req, res, next) {
  let contentPath = `/tangerine/groups/${req.params.group}/`
  return express.static(contentPath).apply(this, arguments);
});

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

// app.post('/editor/release-apk/:group', isAuthenticated, releaseAPK)

// app.post('/editor/release-pwa/:group/', isAuthenticated, releasePWA)

// app.use('/editor/release-online-survey-app/:groupId/:formId/:releaseType/:appName/:uploadKey/', isAuthenticated, releaseOnlineSurveyApp)

// app.use('/editor/unrelease-online-survey-app/:groupId/:formId/:releaseType/', isAuthenticated, unreleaseOnlineSurveyApp)

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





}
