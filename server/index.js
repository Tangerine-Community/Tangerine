/* jshint esversion: 6 */

const util = require('util');
const exec = util.promisify(require('child_process').exec)
const http = require('axios');
const read = require('read-yaml')
const express = require('express')
var session = require("express-session")
const bodyParser = require('body-parser');
const path = require('path')
const app = express()
const fs = require('fs-extra')
const fsc = require('fs')
const config = read.sync('./config.yml')
const sanitize = require('sanitize-filename');
const cheerio = require('cheerio');
const PouchDB = require('pouchdb')
const pako = require('pako')
const compression = require('compression')
const chokidar = require('chokidar');
const tangyReporting = require('../server/reporting/data_processing');
var DB = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  DB = PouchDB.defaults({
    prefix: process.env.T_COUCHDB_ENDPOINT
  });
} else {
  DB = PouchDB.defaults({
    prefix: '/tangerine/db/'
  });
}
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
    forwardPath: function (req, res) {
      var path = require('url').parse(req.url).path;
      console.log("path:" + path);
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
  function (username, password, done) {
    // console.log('strategy!')
    // console.log(username)
    // console.log(password)
    if (username == process.env.T_USER1 && password == process.env.T_USER1_PASSWORD) {
      console.log('login success!')
      return done(null, {
        "name": "user1"
      });
    } else {
      console.log('login fail!')
      return done(null, false, { message: 'Incorrect username or password' })
    }
  }
));

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
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1gb' }))
app.use(bodyParser.text({ limit: '1gb' }))
app.use(compression())
app.use(passport.initialize());
app.use(passport.session());

// Middleware to protect routes.
var isAuthenticated = function (req, res, next) {
  // @TODO Add HTTP AUTH for clients like curl.
  if (req.isAuthenticated()) {
    return next();
  }
  let errorMessage = `Permission denied at ${req.url}`;
  console.log(errorMessage)
  // res.redirect('/');
  res.status(401).send(errorMessage)
}

// Login service.
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.send({ name: 'user1', status: 'ok' });
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

app.use('/releases/', express.static(path.join(__dirname, '../client/releases')))
app.use('/client/', express.static(path.join(__dirname, '../client/builds/dev')))

app.use('/editor/:group/content/assets', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/assets'
  console.log("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});
app.use('/editor/:group/content', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/groups/' + req.params.group
  console.log("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});

app.use('/editor/release-apk/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  console.log("in release-apk, group: " + group + " releaseType: " + releaseType)
  console.log(`The command: ./release-apk.sh ${group} ./content/groups/${group} ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_UPLOAD_USER} ${process.env.T_UPLOAD_PASSWORD} ${process.env.T_HOST_NAME}`)
  await exec(`cd /tangerine/client && \
        ./release-apk.sh ${group} ./content/groups/${group} ${releaseType} ${process.env.T_PROTOCOL} ${process.env.T_UPLOAD_USER} ${process.env.T_UPLOAD_PASSWORD} ${process.env.T_HOST_NAME} 2>&1 | tee -a ../server/apk.log
  `)
  res.send('ok')
})

app.use('/editor/release-pwa/:group/:releaseType', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const group = sanitize(req.params.group)
  const releaseType = sanitize(req.params.releaseType)
  console.log("in release-pwa, group: " + group + " releaseType: " + releaseType)
  await exec(`cd /tangerine/client && \
        ./release-pwa.sh ${group} ./content/groups/${group} ${releaseType}
  `)
  res.send('ok')
})

async function saveFormsJson(formParameters, group) {
  console.log("formParameters: " + JSON.stringify(formParameters))
  let contentRoot = config.contentRoot
  let formsJsonPath = contentRoot + '/' + group + '/forms.json'
  console.log("formsJsonPath:" + formsJsonPath)
  let formJson
  try {
    const exists = await fs.pathExists(formsJsonPath)
    if (exists) {
      console.log("formsJsonPath exists")
      // read formsJsonPath and add formParameters to formJson
      try {
        formJson = await fs.readJson(formsJsonPath)
        console.log("formJson: " + JSON.stringify(formJson))
        console.log("formParameters: " + JSON.stringify(formParameters))
        if (formParameters !== null) {
          formJson.push(formParameters)
        }
        console.log("formJson with new formParameters: " + JSON.stringify(formJson))
      } catch (err) {
        console.error("An error reading the json form: " + err)
      }
    } else {
      // create an empty formJson
      formJson = []
    }
  } catch (err) {
    console.log("Error checking formJson: " + err)
  }

  await fs.writeJson(formsJsonPath, formJson)
}

let openForm = async function (path) {
  let form
  try {
    form = await fs.readFile(path, 'utf8')
  } catch (e) {
    console.log("Error opening form: ", e);
  }
  // console.log("openForm will return form: " + JSON.stringify(form))
  return form
};

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
      // console.log("itemScr: " + itemScr)
      let item = formItemList.is(function (i, el) {
        let src = $(this).attr('src')
        if (src === itemScr) {
          sortedItemList.push($(this))
          return src === itemScr
        }
      })
    }
  }
  // console.log("sortedItemList: " + sortedItemList)
  let tangyform = $('tangy-form')
  // save the updated list back to the form.
  $('tangy-form-item').remove()
  $('tangy-form').append(sortedItemList)
  // console.log('html after: ' + $.html())
  let form = $.html()
  await fs.outputFile(formPath, form)
    .then(() => {
      let msg = "Success! Updated file at: " + formPath
      // let message = {message: msg}
      let resp = {
        "message": msg
      }
      console.log(resp)
      res.send(resp)
    })
    .catch(err => {
      let msg = "An error with form outputFile: " + err
      let message = { message: msg };
      console.error(message)
      res.send(message)
    })
})

// Saves an item - and a new form when formName is passed.async
// otherwise, the path to the existing form is extracted from formHtmlPath.
// contentUrlPath: path used to fetch content when using an APK or PWA. Used when setting 'src' attribute.
// groupContentRoot: path to content on the editor filesystem.
app.post('/editor/item/save', isAuthenticated, async function (req, res) {
  let displayFormsListing = false
  // console.log("req.body:" + JSON.stringify(req.body) + " req.body.itemTitle: " + req.body.itemTitle)
  let formTitle = req.body.formTitle
  if (typeof formTitle !== 'undefined') {
    formTitle = sanitize(formTitle)
  }
  let itemTitle = req.body.itemTitle
  if (typeof itemTitle !== 'undefined') {
    itemTitle = sanitize(itemTitle)
  }
  let formDirName = req.body.formName
  // console.log("formDirName: "+ formDirName)
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
    console.log("Creating a new form.")
    // Append displayFormsListing:true to res if new form.
    displayFormsListing = true
    // Setup the new form by populating the template with the formDirName
    let templatePath = config.editorClientTemplates + sep + 'form-template.html'
    try {
      originalForm = await fs.readFile(templatePath, 'utf8')
    } catch (e) {
      console.log('e', e);
    }
    originalForm = originalForm.replace('FORMNAME', formDirName)
    // create the path to the form and its form.html
    formDir = formDirName
    // now create the filesystem for formDir
    console.log("checking groupContentRoot + sep + formDir: " + groupContentRoot + sep + formDir)
    await fs.ensureDir(groupContentRoot + sep + formDir)
      .then(() => {
        console.log('success! Created path to formDir: ' + groupContentRoot + sep + formDir)
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
    console.log("formParameters: " + JSON.stringify(formParameters))
    await saveFormsJson(formParameters, groupName)
      .then(() => {
        console.log("Updated forms.json")
      })
      .catch(err => {
        console.error("An error saving the json form: " + err)
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
    // console.log('newItem: ' + newItem)
    $(newItem).appendTo('tangy-form')
    // console.log('html after: ' + $.html())
    let form = $.html()
    console.log('now outputting ' + formPath)
    await fs.outputFile(formPath, form)
      .then(() => {
        console.log('success! Updated file at: ' + formPath)
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
    console.log("formPath: " + formPath)
    originalForm = await openForm(formPath);
    // Now that we have originalForm, we can load it and add items to it.
    const $ = cheerio.load(originalForm)
    // search for tangy-form-item
    let formItemList = $('tangy-form-item')
    let formItemListHtml = $('tangy-form-item', 'tangy-form').html()
    let rootHtml = $.html()
    // console.log('itemFilename: ' + itemFilename +  ' formItemListHtml: ' + formItemListHtml + ' rootHtml: ' + rootHtml)
    let isNewItem = true
    // loop through the current items and see if this is an edit or a new item
    let newItemList = $('tangy-form-item').each(function (i, elem) {
      let src = $(this).attr('src')
      // console.log("src: " + src)
      if (src === itemFilename) {
        // console.log("matched  src: " + src)
        $(this).attr('title', itemTitle).html()
        isNewItem = false
      }
    });
    // console.log('newItemList: ' + newItemList + " isNewItem: " + isNewItem)
    $('tangy-form-item').remove()
    $(newItemList).appendTo('tangy-form')
    let itemUrlPath = contentUrlPath + formDir + sep + itemFilename
    if (isNewItem) {
      // create the item html that will be added to the form.
      let newItem = '<tangy-form-item src="' + itemUrlPath + '" id="' + itemId + '" title="' + itemTitle + '">'
      console.log('newItem: ' + newItem)
      $(newItem).appendTo('tangy-form')
    }
    // console.log('html after: ' + $.html())
    let form = $.html()
    console.log('now outputting ' + formPath)
    await fs.outputFile(formPath, form)
      .then(() => {
        console.log('success! Updated file at: ' + formPath)

      })
      .catch(err => {
        console.error("An error with form outputFile: " + err)
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
  console.log("formPath : " + formPath + " itemFilename: " + itemFilename + " groupName: " + groupName)
  console.log("Saving item at : " + itemPath + "  itemHtmlText: " + itemHtmlText)
  await fs.outputFile(itemPath, itemHtmlText)
    .then(() => {
      console.log('Success! Created item at: ' + itemPath)
    })
    .catch(err => {
      console.error("An error with item outputFile: " + err)
      res.send(err)
    })
  let resp = {
    "message": 'Item saved: ' + itemPath,
    "displayFormsListing": displayFormsListing
  }
  // console.log("resp: "+  JSON.stringify(resp))
  res.json(resp)
})

/**
 * Sets up files and directories for a group:
 * Creates content, qa, and prod dirs for the group; seeds qa with Cordova project.
 * Edits app-config.json.
 * Creates cordova-hcp.json and copies to qa dir.
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
    console.error("An error reading app-config: " + err)
    throw err;
  }
  await fs.writeFile(`/tangerine/client/content/groups/${groupName}/app-config.json`, JSON.stringify(appConfig))
    .then(status => console.log("Wrote app-config.json"))
    .catch(err => console.error("An error copying app-config: " + err))

  // All done!
  res.redirect('/editor/' + groupName + '/tangy-forms/editor.html')
})

app.get('/groups', isAuthenticated, async function (req, res) {
  fsc.readdir('/tangerine/client/content/groups', function (err, files) {
    let filteredFiles = files.filter(junk.not)
    console.log('/groups route lists these dirs: ' + filteredFiles)
    let groups = filteredFiles.map((groupName) => {
      return {
        attributes: {
          name: groupName
        },
        member: [],
        admin: [],
        numberOfResults: 0
      }
    })
    res.send(groups)

  })
})

// @TODO: Middleware auth check for upload user.
app.post('/upload/:groupName', async function (req, res) {
  let db = new DB(req.params.groupName)
  try {
    const payload = pako.inflate(req.body, { to: 'string' })
    const packet = JSON.parse(payload)
    // New docs should not have a rev or else insertion will fail.
    delete packet.doc._rev
    await db.put(packet.doc).catch(err => console.log(err))
    res.send('ok')
  } catch (e) { console.log(e) }

})

const flatten = require('flat')
const json2csv = require('json2csv')
const _ = require('underscore')

jlog = function (data) {
  console.log(JSON.stringify(data, null, 2))
}
log = function (data) {
  console.log(data)
}


app.get('/csv/:groupName/:formId', isAuthenticated, async function (req, res) {
  let db = new DB(req.params.groupName)
  let allDocs = await db.allDocs({ include_docs: true })
  let responseRows = allDocs.rows
    .filter(row => row.doc.collection == 'TangyFormResponse')
    .filter(row => row.doc.form.id == req.params.formId)
  let responseDocs = responseRows.map(row => row.doc)
  let docsKeyedByVariableName = []
  responseDocs.forEach(doc => {
    let variables = {}
    variables['_id'] = doc._id
    variables['formId'] = doc.form.id
    variables['startDatetime'] = doc.startDatetime
    variables['startUnixtime'] = doc.startUnixtime
    doc.inputs.forEach(input => {
      variables[input.name] = input.value
    })
    doc.items.forEach(item => {
      item.inputs.forEach(input => {
        if (Array.isArray(input.value)) {
          input.value.forEach(subInput => variables[`${input.name}.${subInput.name}`] = subInput.value)
        } else {
          variables[input.name] = input.value
        }
      })
    })
    docsKeyedByVariableName.push(variables)
  })

  let flatVariableDocs = docsKeyedByVariableName.map(doc => flatten(doc))
  let keys = []
  for (let doc of flatVariableDocs) {
    keys = _.uniq(keys.concat(Object.getOwnPropertyNames(doc)))
  }
  try {
    var result = json2csv({ data: flatVariableDocs, fields: keys });
  } catch (err) {
    console.error(err);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv');
  res.write(result)
  res.end()
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

console.log(process.env.T_REPLICATE)
try {
  replicationEntries = JSON.parse(process.env.T_REPLICATE)
} catch (e) { console.log(e) }

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


app.get('/csv/byPeriodAndFormId/:groupName/:year/:/month/:formId', isAuthenticated, async (req, res) => {

  const groupName = req.params.groupName;
  const year = req.params.year;
  const month = req.params.month;
  const formId = req.params.formId;
  await generateCSVByPeriodAndFormId(groupName, year, month, formId);
});
/**
 * @function`getDirectories` returns an array of strings of the top level directories found in the path supplied
 * @param {string} srcPath The path to the directory
 */
const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.lstatSync(path.join(srcPath, file)).isDirectory());
/**
 * Watch for Filesystem changes. Only watch creation of subdirectories in `../client/content/groups/`
 * Ignore files in the content path
 * Ignore files subdirectories of the directories in the content path
 * @example It will listen directory/folder creation events in the top level directory of `..client/content/groups/`
 *          When a directory is created in `..client/content/groups/`, the callback fires.
 *          When a directory is created within the groups folder for instance in `..client/content/groups/group1`
 *          no callback is called.
 */

function watchGroups() {
  const CONTENT_PATH = '../client/content/groups/';
  let groups = getDirectories(CONTENT_PATH);
  groups.map(group => monitorDatabaseChangesFeed(group.trim()));

  chokidar.watch(CONTENT_PATH, { ignored: ['**.*', '/**/*'], ignoreInitial: true }).on('all', (event, path) => {
    if (event === 'addDir') {
      /**
       * The Path is a string in the form `../client/content/groups/:groupName`
       * Split the string to get the groupName from the `path` variable
       */
      monitorDatabaseChangesFeed((path.split('/')[4].trim()));
    }
  });

}
watchGroups();

/**
 * Listens to the changes feed of a database and passes new documents to `processChangedDocument()` for processing and saving
 * in the corresponding group results database.
 * @param {string} name the group's database for which to listen to the changes feed.
 */
async function monitorDatabaseChangesFeed(name) {
  const GROUP_DB = new DB(name);
  const RESULT_DB = new DB(`${name}-result`);
  /**
   * Instantiate the database. A method call on the database creates the database if database doesnt exist.
   */
  await RESULT_DB.info().catch(e => {
    console.error(e);
  });
  try {
    GROUP_DB.changes({ since: 'now', include_docs: true, live: true })
      .on('change', (body) => {
        if (!body.deleted) tangyReporting.saveProcessedFormData(body, RESULT_DB);// Dont send deleted docs for processing
      })
      .on('error', (err) => console.error(err));
  } catch (err) {
    console.error(err);
  }
}

/**
 * Given the params `groupName`, `year`, `month`, `formId` generate a CSV based on the
 * groupName, the formId and for a specific year and month combination
 * @param {string} groupName 
 * @param {string} year 
 * @param {string} month 
 * @param {string} formId 
 */
async function generateCSVByPeriodAndFormId(groupName, year, month, formId) {
}
// Start the server.
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Server V3: http://%s:%s', host, port);
});
