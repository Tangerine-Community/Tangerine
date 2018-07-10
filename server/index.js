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
const config = read.sync('./config.yml')
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
let newGroupQueue = []

pouchDbDefaults = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  pouchDbDefaults = { prefix: process.env.T_COUCHDB_ENDPOINT }
} else {
  pouchDbDefaults = { prefix: '/tangerine/db/' }
}
const DB = PouchDB.defaults(pouchDbDefaults)
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
var isAuthenticated = function (req, res, next) {
  // Uncomment next two lines when you want to turn off authentication during development.
  // req.user = {}; req.user.name = 'user1';
  // return next();
  if (req.isAuthenticated()) {
    return next();
  }
  let errorMessage = `Permission denied at ${req.url}`;
  log.warn(errorMessage)
  // res.redirect('/');
  res.status(401).send(errorMessage)
}

// Login service.
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.send({ name: req.user.name, statusCode: 200, statusMessage: 'ok' });
  }
);

// Static assets.
app.use('/editor', express.static(path.join(__dirname, '../client/tangy-forms/editor')));
app.use('/', express.static(path.join(__dirname, '../editor/dist')));
app.use('/editor/groups', isAuthenticated, express.static(path.join(__dirname, '../client/content/groups')));
app.use('/editor/:group/tangy-forms/', express.static(path.join(__dirname, '../client/tangy-forms/')));
app.use('/editor/:group/ckeditor/', express.static(path.join(__dirname, '../editor/src/ckeditor/')));
app.use('/ckeditor', express.static(path.join(__dirname, '../editor/src/ckeditor')));
app.use('/ace', express.static(path.join(__dirname, '../editor/node_modules/ace-builds')));
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
  log.info("in release-apk, group: " + group + " releaseType: " + releaseType + `The command: ./release-apk.sh ${group} ./content/groups/${group} ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_UPLOAD_USER} ${process.env.T_UPLOAD_PASSWORD} ${process.env.T_HOST_NAME}`)

  try {
    await exec(`cd /tangerine/client && \
        ./release-apk.sh ${group} ./content/groups/${group} ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_UPLOAD_USER} ${process.env.T_UPLOAD_PASSWORD} ${process.env.T_HOST_NAME} 2>&1 | tee -a ../server/apk.log
  `)
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
    await exec(`cd /tangerine/client && \
        ./release-pwa.sh ${group} ./content/groups/${group} ${releaseType}
  `)
    res.send({ statusCode: 200, data: 'ok' })
  } catch (error) {
    res.send({ statusCode: 500, data: error })
  }
})

async function saveFormsJson(formParameters, group) {
  clog("formParameters: " + JSON.stringify(formParameters))
  let contentRoot = config.contentRoot
  let formsJsonPath = contentRoot + '/' + group + '/forms.json'
  clog("formsJsonPath:" + formsJsonPath)
  let formJson
  try {
    const exists = await fs.pathExists(formsJsonPath)
    if (exists) {
      clog("formsJsonPath exists")
      // read formsJsonPath and add formParameters to formJson
      try {
        formJson = await fs.readJson(formsJsonPath)
        clog("formJson: " + JSON.stringify(formJson))
        clog("formParameters: " + JSON.stringify(formParameters))
        if (formParameters !== null) {
          formJson.push(formParameters)
        }
        clog("formJson with new formParameters: " + JSON.stringify(formJson))
      } catch (err) {
        log.error("An error reading the json form: " + err)
      }
    } else {
      // create an empty formJson
      formJson = []
    }
  } catch (err) {
    log.error("Error checking formJson: " + err)
  }

  await fs.writeJson(formsJsonPath, formJson)
}

let openForm = async function (path) {
  let form
  try {
    form = await fs.readFile(path, 'utf8')
  } catch (e) {
    log.error("Error opening form: ", e);
  }
  return form
};



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
    res.sendStatus(500)
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
app.post('/editor/itemsOrder/save', isAuthenticated, async function (req, res) {
  let contentRoot = config.contentRoot
  let itemsOrder = req.body.itemsOrder
  let formHtmlPath = req.body.formHtmlPath

  // fetch the original form
  let formDir = formHtmlPath.split('/')[2]
  let formName = formHtmlPath.split('/')[3]
  let formPath = contentRoot + sep + formDir + sep + formName
  let originalForm = await openForm(formPath);

  // Now that we have originalForm, we can load it and add items to it.
  const $ = cheerio.load(originalForm)
  // search for tangy-form-item
  let formItemList = $('tangy-form-item')
  let sortedItemList = []
  for (let itemScr of itemsOrder) {
    if (itemScr !== null) {
      let item = formItemList.is(function(i, el) {
        let src = $(this).attr('src')
        if (src === itemScr) {
          sortedItemList.push($(this))
          return src === itemScr
        }
      })
    }
  }
  let tangyform = $('tangy-form')
  // save the updated list back to the form.
  $('tangy-form-item').remove()
  $('tangy-form').append(sortedItemList)
  let form = pretty($.html({decodeEntities: false}).replace('<html><head></head><body>', '').replace('</body></html>', ''))
  await fs.outputFile(formPath, form)
    .then(() => {
      let msg = "Success! Updated file at: " + formPath
      let resp = {
        "message": msg
      }
      clog(resp)
      res.send(resp)
    })
    .catch(err => {
      let msg = "An error with form outputFile: " + err
      let message = { message: msg };
      log.error(message)
      res.send(message)
    })
})

app.post('/editor/file/save', isAuthenticated, async function (req, res) {
  const filePath = req.body.filePath
  const groupId = req.body.groupId
  const fileContents = req.body.fileContents
  const actualFilePath = `/tangerine/client/content/groups/${groupId}/${filePath}`
  await fs.writeFile(actualFilePath, fileContents)
  res.send('ok')
})

// Saves an item - and a new form when formName is passed.async
// otherwise, the path to the existing form is extracted from formHtmlPath.
// contentUrlPath: path used to fetch content when using an APK or PWA. Used when setting 'src' attribute.
// groupContentRoot: path to content on the editor filesystem.
app.post('/editor/item/save', isAuthenticated, async function (req, res) {
  let displayFormsListing = false
  let formTitle = req.body.formTitle
  if (typeof formTitle !== 'undefined') {
    formTitle = sanitize(formTitle)
  }
  let itemTitle = req.body.itemTitle
  if (typeof itemTitle !== 'undefined') {
    itemTitle = sanitize(itemTitle)
  }
  let formDirName = req.body.formName
  if (typeof formDirName !== 'undefined') {
    formDirName = sanitize(req.body.formName).replace(/ /g, '')
  }
  let itemHtmlText = req.body.itemHtmlText
  let formHtmlPath = req.body.formHtmlPath
  let itemFilename = req.body.itemFilename
  let groupName = req.body.groupName
  let itemId = req.body.itemId
  let groupContentRoot = config.contentRoot + '/' + groupName
  let formDir, formName, originalForm, formPath
  let contentUrlPath = '../content/'

  // Need to populate the originalForm var
  // First, check if this is a new form, which don't have formHtmlPath,
  if (formHtmlPath === null) {
    log.info("Creating a new form.")
    // Append displayFormsListing:true to res if new form.
    displayFormsListing = true
    // Setup the new form by populating the template with the formDirName
    let templatePath = config.editorClientTemplates + sep + 'form-template.html'
    try {
      originalForm = await fs.readFile(templatePath, 'utf8')
    } catch (e) {
      log.error(e);
    }
    originalForm = originalForm.replace('FORMNAME', formDirName)
    // create the path to the form and its form.html
    formDir = formDirName
    // now create the filesystem for formDir
    clog("checking groupContentRoot + sep + formDir: " + groupContentRoot + sep + formDir)
    await fs.ensureDir(groupContentRoot + sep + formDir)
      .then(() => {
        log.info('success! Created path to formDir: ' + groupContentRoot + sep + formDir)
      })
      .catch(err => {
        console.error("An error: " + err)
      })
    formName = 'form.html'
    // Update forms.json

    let formParameters = {
      "id": formDirName,
      "title": formTitle,
      "src": contentUrlPath + formDirName + "/form.html"
    }
    clog("formParameters: " + JSON.stringify(formParameters))
    await saveFormsJson(formParameters, groupName)
      .then(() => {
        log.info("Updated forms.json")
      })
      .catch(err => {
        log.error("An error saving the json form: " + err)
        throw err;
      })
    // Set formPath
    formPath = groupContentRoot + sep + formDir + sep + formName

    // Now that we have originalForm, we can load it and add items to it.
    const $ = cheerio.load(originalForm)
    // search for tangy-form-item
    let formItemList = $('tangy-form-item')
    // create the form html that will be added
    let itemUrlPath = contentUrlPath + formDirName + sep + itemFilename
    let newItem = '<tangy-form-item src="' + itemUrlPath + '" id="' + itemId + '" title="' + itemTitle + '">'
    $(newItem).appendTo('tangy-form')
    let form = pretty($.html({decodeEntities: false}).replace('<html><head></head><body>', '').replace('</body></html>', ''))
    clog('now outputting ' + formPath)
    await fs.outputFile(formPath, form)
      .then(() => {
        log.info('success! Updated file at: ' + formPath)
      })
      .catch(err => {
        console.error("An error with form outputFile: " + err)
        res.send(err)
      })
  } else {
    // Editing a form - check if this is a new item; otherwise, we only need to change the item's title in form.json
    formDir = formHtmlPath.split('/')[2]
    formName = formHtmlPath.split('/')[3]
    formPath = groupContentRoot + sep + formDir + sep + formName
    clog("formPath: " + formPath)
    originalForm = await openForm(formPath);
    // Now that we have originalForm, we can load it and add items to it.
    const $ = cheerio.load(originalForm)
    // search for tangy-form-item
    let formItemList = $('tangy-form-item')
    let formItemListHtml = $('tangy-form-item', 'tangy-form').html()
    let rootHtml = $.html()
    let isNewItem = true
    // loop through the current items and see if this is an edit or a new item
    let newItemList = $('tangy-form-item').each(function (i, elem) {
      let src = $(this).attr('src')
      if (src === itemFilename) {
        $(this).attr('title', itemTitle).html()
        isNewItem = false
      }
    });
    $('tangy-form-item').remove()
    $(newItemList).appendTo('tangy-form')
    let itemUrlPath = contentUrlPath + formDir + sep + itemFilename
    if (isNewItem) {
      // create the item html that will be added to the form.
      let newItem = '<tangy-form-item src="' + itemUrlPath + '" id="' + itemId + '" title="' + itemTitle + '">'
      log.info('newItem: ' + newItem)
      $(newItem).appendTo('tangy-form')
    }
    let form = pretty($.html({decodeEntities: false}).replace('<html><head></head><body>', '').replace('</body></html>', ''))
    clog('now outputting ' + formPath)
    await fs.outputFile(formPath, form)
      .then(() => {
        log.info('success! Updated file at: ' + formPath)

      })
      .catch(err => {
        log.error("An error with form outputFile: " + err)
        res.send(err)
      })
  }
  // Save the item
  const itemFilenameArr = itemFilename.split('/');
  let onlyItemFilename = itemFilenameArr[3]
  // If it's a new form, the itemFilename is only the uuid. If you're editing a form, it is a path. Sorry.
  if (itemFilenameArr.length === 1) {
    onlyItemFilename = itemFilename
  }
  let itemPath = formPath.substring(0, formPath.lastIndexOf("/")) + sep + onlyItemFilename;
  clog("formPath : " + formPath + " itemFilename: " + itemFilename + " groupName: " + groupName)
  clog("Saving item at : " + itemPath + "  itemHtmlText: " + itemHtmlText)
  await fs.outputFile(itemPath, itemHtmlText)
    .then(() => {
      log.info('Success! Created item at: ' + itemPath)
    })
    .catch(err => {
      log.error("An error with item outputFile: " + err)
      res.send(err)
    })
  let resp = {
    "message": 'Item saved: ' + itemPath,
    "displayFormsListing": displayFormsListing
  }
  res.json(resp)
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

  let groupName = req.body.groupName
  // Create content directory for group.
  await exec(`cp -r /tangerine/client/content/default /tangerine/client/content/groups/${groupName}`)

  // Edit the app-config.json.
  try {
    appConfig = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, "utf8"))
    appConfig.uploadUrl = `${process.env.T_PROTOCOL}://${process.env.T_UPLOAD_USER}:${process.env.T_UPLOAD_PASSWORD}@${process.env.T_HOST_NAME}/upload/${groupName}`
  } catch (err) {
    log.error("An error reading app-config: " + err)
    throw err;
  }
  await fs.writeFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, JSON.stringify(appConfig))
    .then(status => log.info("Wrote app-config.json"))
    .catch(err => log.error("An error copying app-config: " + err))

  //#region wire group DB and result db

  const REPORTING_DB_NAME = `${groupName}-reporting`;
  const REPORTING_DB = new DB(REPORTING_DB_NAME);
  /**
   * Instantiate the results database. A method call on the database creates the database if database doesnt exist.
   * Also create the design doc for the resultsDB
   */
  await REPORTING_DB.info(async info => await createDesignDocument(REPORTING_DB_NAME)).catch(e => {
    log.error(e);
  });

  newGroupQueue.push(groupName)

  // Set up watching of groupDb for changes.
  //#endregion

  // All done!
  res.send({ data: 'Group Created Successfully', statusCode: 200 });
})

app.get('/groups', isAuthenticated, async function (req, res) {
  if (await isSuperAdmin(req.user.name)) {
    fsc.readdir('/tangerine/client/content/groups', function (err, files) {
      let filteredFiles = files.filter(junk.not)
      let groups = [];
      clog('/groups route lists these dirs: ' + filteredFiles)
      groups = filteredFiles.map((groupName) => {
        return {
          attributes: {
            name: groupName
          }
        }
      })
      res.send(groups)
    })
  } else {
    const user = await findUserByUsername(req.user.name);
    let groups = [];
    if (typeof user.groups !== 'undefined') {
      groups = user.groups.map(group => {
        return {
          attributes: {
            name: group.groupName
          }
        }
      });
    }
    res.send(groups)
  }
})

async function isSuperAdmin(username) {
  return username === process.env.T_USER1;
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
// @TODO: Middleware auth check for upload user.
app.post('/upload/:groupName', async function (req, res) {
  let db = new DB(req.params.groupName)
  try {
    const payload = pako.inflate(req.body, { to: 'string' })
    const packet = JSON.parse(payload)
    // New docs should not have a rev or else insertion will fail.
    delete packet.doc._rev
    await db.put(packet.doc).catch(err => log.error(err))
    res.send('ok')
  } catch (e) { log.error(e) }

})
// TODO Notify caller if group doesnt have form response, to avoid infinite polling  
app.get('/csv/:groupName/:formId', async function (req, res) {
  const groupName = sanitize(req.params.groupName)
  const formId = sanitize(req.params.formId)
  const fileName = `${groupName}-${formId}-${Date.now()}.csv`
  const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
  const outputPath = `/csv/${fileName}`
  const cmd = `cd /tangerine/scripts/generate-csv/ && ./bin.js '${JSON.stringify(pouchDbDefaults)}' ${groupName}-reporting ${formId} ${outputPath} ${batchSize}`
  clog(cmd)
  exec(cmd)
  res.send({
    stateUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.csv', '.state.json')}`,
    downloadUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  })
})

app.get('/test/generate-tangy-form-responses/:numberOfResponses/:groupName', isAuthenticated, async function (req, res) {
  let db = new DB(req.params.groupName)
  const template = require('./template.json');
  delete template._rev
  let i = 0
  while (i <= parseInt(req.params.numberOfResponses)) {
    await db.put(Object.assign({}, template, { _id: crypto.randomBytes(20).toString('hex') }))
    i++
  }
  res.send('ok')
})

let replicationEntries = []

clog(process.env.T_REPLICATE)
try {
  replicationEntries = JSON.parse(process.env.T_REPLICATE)
} catch (e) { log.error(e) }

if (replicationEntries.length > 0) {
  for (let replicationEntry of replicationEntries) {
    let options = {}
    if (replicationEntry.continuous && replicationEntry.continuous === true) {
      options.continuous = true
    }
    DB.replicate(
      replicationEntry.from,
      replicationEntry.to,
      options
    )
  }
}


app.get('/csv/byPeriodAndFormId/:groupName/:formId/:year?/:month?', isAuthenticated, (req, res) => {
  const groupName = req.params.groupName;
  const year = req.params.year;
  const month = req.params.month;
  const formId = req.params.formId;
  const groupReportingDbName = groupName + '-reporting';

  generateCSV(formId, groupReportingDbName, res);
});

/**
 * @description Function to create Design Documents in a given Database
 * @param {string} database The Database to use when for creating the Design Document
 *
 * `tangyReportingDesignDoc` is an Object that holds the Design Doc with views to be stored in the DB
 *
 * For compound keys in the design doc use string concatenation as a compilation error is thrown when using template strings
 * @example
 * use form.docId+'-'+doc.completed not `${doc.docId}-${doc.completed}`
 */
async function createDesignDocument(database) {
  const REPORTING_DB = new DB(database);

  const tangyReportingDesignDoc = {
    _id: '_design/tangy-reporting',
    version: '1',
    views: {
      resultsByGroupFormId: {
        map: function (doc) {
          if (doc.formId) {
            const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const startDatetime = new Date(doc.startDatetime);
            const key = doc.formId + '_' + startDatetime.getFullYear() + '_' + MONTHS[startDatetime.getMonth()];
            //The emmitted value is in the form "formId" i.e `formId` and also "formId_2018_May" i.e `formId_Year_Month`
            emit(doc.formId);
            emit(key);
          }
        }.toString()
      }
    }
  }

  try {
    const designDoc = await REPORTING_DB.get('_design/tangy-reporting');
    if (designDoc.version !== tangyReportingDesignDoc.version) {
      log.info(`✓ Time to update _design/tangy-reporting for ${database}`);
      log.info(`Removing _design/tangy-reporting for ${database}`);
      await REPORTING_DB.remove(designDoc)
      log.info(`Cleaning up view indexes for ${database}`);
      // @TODO This causes conflicts with open databases. How to avoid??
      //await REPORTING_DB.viewCleanup()
      log.info(`Creating _design/tangy-reporting for ${database}`);
      await REPORTING_DB.put(tangyReportingDesignDoc).
        then(info => log.info(`√ Created _design/tangy-reporting for ${database} succesfully`));
    }
  } catch (error) {
    if (error.error === 'not_found') {
      await REPORTING_DB.put(tangyReportingDesignDoc).catch(err => log.error(err));
    }
  }
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
  const CONTENT_PATH = '../client/content/groups/'
  const groups = getDirectories(CONTENT_PATH)
  return groups.map(group => group.trim()).filter(groupName => groupName !== '.git')
}

const keepAliveReportingWorker = async initialGroups => {
  // Populate worker-state.json if there any initialGroups not currently being watched.
  let workerState = JSON.parse(await readFile('/worker-state.json', 'utf-8'))
  if (!workerState.databases) workerState.databases = []
  for (let groupName of initialGroups) {
    let feed = workerState.databases.find(database => database.name === groupName)
    if (!feed) workerState.databases.push({name: groupName, sequence: 0})
  }
  workerState.pouchDbDefaults = pouchDbDefaults
  await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
  // Declare variables now so they don't have to be delared continuously and garbage collected later.
  let response = {
    stdout: '',
    stderr: ''
  } 
  // Keep alive.
  while(true) {
    // Hook in and add a new group if it is queued.
    while (newGroupQueue.length > 0) {
      workerState = JSON.parse(await readFile('/worker-state.json', 'utf-8'))
      workerState.databases.push({name: newGroupQueue.pop(), sequence: 0})
      await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
    }
    // Run the worker.
    try {
      response = await exec('cat /worker-state.json | /tangerine/server/reporting/run-worker.js');
      if (typeof response.stderr === 'object') {
        log.warn(`run-worker.js STDERR: ${JSON.stringify(response.stderr)}`)
      } else if (response.stderr) {
        log.warn(`run-worker.js STDERR: ${response.stderr}`)
      }
      try {
        workerState = JSON.parse(response.stdout)
        // Wrap up. If nothing was last processed, sleep for 30 seconds.
        if (workerState.processed === 0) {
          await sleep (30*1000) 
        } else {
          log.info(`Processed ${workerState.processed} changes.`)
        }
        await writeFile('/worker-state.json', JSON.stringify(workerState), 'utf-8')
      } catch (error) {
        log.warn(error)
      }
    } catch(error) {
      log.error(error)
    }
    
  }
}
const initialGroups = allGroups()
keepAliveReportingWorker(initialGroups)

// Start the server.
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  log.info(server.address());
  log.info('Server V3: http://%s:%s', host, port);
});