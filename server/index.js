/* jshint esversion: 6 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const http = require('axios');
const read = require('read-yaml');
const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const fs = require('fs-extra');
const fsc = require('fs');
const config = read.sync('./config.yml');
const sanitize = require('sanitize-filename');
const cheerio = require('cheerio');
const nano = require('nano');
const PouchDB = require('pouchdb');
const DB = PouchDB.defaults({
  prefix: '/tangerine/db/'
});
const requestLogger = require('./middlewares/requestLogger');
let crypto = require('crypto');
const junk = require('junk');
const sep = path.sep;
/*
 * Auth
 */
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// This determines wether or not a login is valid.
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('strategy!')
    console.log(username)
    console.log(password)
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
passport.serializeUser(function(user, done) {
  done(null, user.name);
});

// This transforms the id in the session cookie to pass to req.user object.
passport.deserializeUser(function(id, done) {
  done(null, {name: id});
});

/**
 * Reporting Controllers.
 */

const assessmentController = require('./reporting/controllers/assessment');
const resultController = require('./reporting/controllers/result');
const workflowController = require('./reporting/controllers/workflow');
const csvController = require('./reporting/controllers/generate_csv');
const changesController = require('./reporting/controllers/changes');
const tripController = require('./reporting/controllers/trip');

// Use sessions.
app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());

/**
 * Hook data processing function to couchDB changes feed.
 */

const dbConfig = require('./reporting/config');
const GROUP_DB = new PouchDB(dbConfig.base_db);
const RESULT_DB = new PouchDB(dbConfig.result_db);
const dbQuery = require('./reporting/utils/dbQuery');
const processChangedDocument = require('./reporting/controllers/changes').processChangedDocument;

// TODO: Confirm if you will need this part
// let replicationHandler = GROUP_DB.replicate.to(RESULT_DB, { live: true, retry: true });

// TODO: Update to PouchDB changes format
// const feed = groupTabletDB.follow({ since: 'now', include_docs: true });

// feed.on('change', async (resp) => {
//   feed.pause();
//   processChangedDocument(resp, dbConfig.base_db, dbConfig.result_db);
//   setTimeout(function () { feed.resume() }, 500);
// });

// feed.on('error', (err) => Error(err));
// feed.follow();


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
  function(req, res) {
    res.send({name: 'user1', status: 'ok'});
  }
);

// Static assets.
app.use('/editor', express.static(path.join(__dirname, '../client/tangy-forms/editor')));
app.use('/', express.static(path.join(__dirname, '../editor/dist')));
app.use('/editor/groups', isAuthenticated, express.static(path.join(__dirname, '../client/content/groups')));
app.use('/editor/:group/tangy-forms/', express.static(path.join(__dirname, '../client/tangy-forms/')));
app.use('/editor/:group/ckeditor/', express.static(path.join(__dirname, '../client/ckeditor/')));
app.use('/editor/assets/', express.static(path.join(__dirname, '../client/content/assets/')));

app.use('/releases/pwas/', express.static(path.join(__dirname, '../client/releases/pwas')) )
app.use('/releases/apks/', express.static(path.join(__dirname, '../client/releases/apks')) )
app.use('/client/', express.static(path.join(__dirname, '../client/builds/dev')) )
app.use('/editor/:group/content', isAuthenticated, function (req, res, next) {
  let contentPath = '../client/content/groups/' + req.params.group
  console.log("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});

app.use('/editor/release-apk/:secret/:group', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const secret = sanitize(req.params.secret)
  const group = sanitize(req.params.group)
  await exec(`cd /tangerine/client && \
        ./release-apk.sh ${secret} ./content/groups/${group}
  `)
  res.send('ok')
})

app.use('/editor/release-pwa/:secret/:group', isAuthenticated, async function (req, res, next) {
  // @TODO Make sure user is member of group.
  const secret = sanitize(req.params.secret)
  const group = sanitize(req.params.group)
  await exec(`cd /tangerine/client && \
        ./release-pwa.sh ${secret} ./content/groups/${group}
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
      let item = formItemList.is(function(i, el) {
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
      let message = {message: msg};
      console.error(message)
      res.send(message)
    })
})

// Saves an item - and a new form when formName is passed.async
// otherwise, the path to the existing form is extracted from formHtmlPath.
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
    formDirName = sanitize(req.body.formName).replace(/ /g,'')
  }
  let itemHtmlText = req.body.itemHtmlText
  let formHtmlPath = req.body.formHtmlPath
  let itemFilename = req.body.itemFilename
  let groupName = req.body.groupName
  let itemId = req.body.itemId
  let contentRoot = config.contentRoot + '/' + groupName
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
      originalForm = await fs.readFile(templatePath,'utf8')
    } catch (e) {
      console.log('e', e);
    }
    originalForm = originalForm.replace('FORMNAME', formDirName)
    // create the path to the form and its form.html
    formDir = formDirName
    // now create the filesystem for formDir
    console.log("checking contentRoot + sep + formDir: " + contentRoot + sep + formDir)
    await fs.ensureDir(contentRoot + sep + formDir)
      .then(() => {
        console.log('success! Created path to formDir: ' + contentRoot + sep + formDir)
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
    formPath = contentRoot + sep + formDir + sep + formName

    // Now that we have originalForm, we can load it and add items to it.
    const $ = cheerio.load(originalForm)
    // search for tangy-form-item
    let formItemList = $('tangy-form-item')
    // create the form html that will be added
    let itemUrlPath = contentUrlPath + formDirName + "/" + itemFilename
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
    formPath = contentRoot + sep + formDir + sep + formName
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
    let newItemList = $('tangy-form-item').each(function(i, elem) {
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
    let itemUrlPath = contentUrlPath + formDir + "/" + itemFilename
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
    "displayFormsListing":displayFormsListing
  }
  // console.log("resp: "+  JSON.stringify(resp))
  res.json(resp)
})

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

// kick it off
var server = app.listen(config.port, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Server V3: http://%s:%s', host, port);
});

app.get('/groups', isAuthenticated, async function (req, res) {
  fsc.readdir('/tangerine/client/content/groups', function(err, files) {
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
  console.log(req.params.groupName)
  let db = new DB(req.params.groupName)
  // New docs should not have a rev or else insertion will fail.
  delete req.body.doc._rev
  await db.put(req.body.doc).catch(err => console.log(err))
  res.send('ok')
})

const flatten = require('flat')
const json2csv = require('json2csv')
const _ = require('underscore')

jlog = function(data) {
  console.log(JSON.stringify(data, null, 2))
}
log = function(data) {
  console.log(data)
}

app.get('/csv/:groupName/:formId', isAuthenticated, async function (req, res) {
  let db = new DB(req.params.groupName)
  let allDocs = await db.allDocs({include_docs: true})
  let responseRows = allDocs.rows
    .filter(row => row.doc.collection == 'TangyFormResponse')
    .filter(row => row.doc.form.id == req.params.formId)
  let responseDocs = responseRows.map(row => row.doc)
  let variableDocs = responseDocs.map(doc => {
    let variables = {}
    doc.inputs.forEach(item => {
      variables[item.name] = item.value
    })
    return variables
  })
  let flatVariableDocs = variableDocs.map(doc => flatten(doc))
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


/**
 * Reporting App routes
 */

app.post('/assessment', assessmentController.all);
app.post('/assessment/headers/:id', assessmentController.generateHeader);

app.post('/result', resultController.all);
app.post('/assessment/result/:id', resultController.processResult);

app.post('/workflow', workflowController.all);
app.post('/workflow/headers/:id', workflowController.generateHeader);
app.post('/workflow/result/:id', tripController.processResult);

app.post('/generate_csv/:id', csvController.generate);
app.post('/tangerine_changes', changesController.changes);
app.post('/get_processed_results/:id', dbQuery.processedResultsById);

app.get('/test/generate-tangy-form-responses/:numberOfResponses/:groupName', isAuthenticated, async function (req, res) {
  let db = new DB(req.params.groupName)
  const template = {"collection":"TangyFormResponse","form":{"id":"field-demo","databaseName":"r","responseId":"","onChange":"","linearMode":false,"hideClosedItems":false,"hideResponses":false,"hideCompleteButton":false,"tagName":"TANGY-FORM"},"items":[{"id":"item_1","src":"../content/field-demo/text-inputs.html","title":"Text Inputs","hideButtons":false,"inputs":["text_input_1","text_input_2","text_input_3","text_input_4","text_input_5"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"},{"id":"item_2","src":"../content/field-demo/checkboxes.html","title":"Checkboxes","hideButtons":false,"inputs":["checkbox_1","checkbox_2","checkbox_3","checkbox_4","checkbox_5","checkbox_6","checkbox_group_1","checkbox_group_2","checkbox_group_3","checkbox_group_4","checkbox_group_4_enable","checkbox_group_5","checkbox_group_5_show"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"},{"id":"item_3","src":"../content/field-demo/radio-buttons.html","title":"Radiobuttons","hideButtons":false,"inputs":["radio_buttons_1","radio_buttons_2","radio_buttons_3","radio_buttons_3_enable","radio_buttons_4","radio_buttons_4_show"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"},{"id":"item_4","src":"../content/field-demo/location.html","title":"Location","hideButtons":false,"inputs":["location"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"},{"id":"item_5","src":"../content/field-demo/timed-grid.html","title":"Timed Grid","hideButtons":false,"inputs":["class1_term2"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"},{"id":"item_6","src":"../content/field-demo/gps.html","title":"GPS","hideButtons":false,"inputs":["gps-coords"],"open":false,"incomplete":false,"disabled":false,"hidden":false,"tagName":"TANGY-FORM-ITEM"}],"inputs":[{"name":"text_input_1","label":"This is an input for text.","type":"text","errorMessage":"","required":false,"disabled":true,"hidden":false,"invalid":false,"incomplete":false,"value":"S","allowedPattern":"","tagName":"TANGY-INPUT"},{"name":"text_input_2","label":"This is an input for text that is required.","type":"text","errorMessage":"This is required.","required":true,"disabled":true,"hidden":false,"invalid":false,"incomplete":false,"value":"af","allowedPattern":"","tagName":"TANGY-INPUT"},{"name":"text_input_3","label":"This text input is disabled.","type":"text","errorMessage":"","required":false,"disabled":true,"hidden":false,"invalid":false,"incomplete":true,"value":"","allowedPattern":"","tagName":"TANGY-INPUT"},{"name":"text_input_4","label":"This text input requires a valid email address.","type":"email","errorMessage":"A valid email address is required.","required":false,"disabled":true,"hidden":false,"invalid":false,"incomplete":false,"value":"3@kd.co","allowedPattern":"","tagName":"TANGY-INPUT"},{"name":"text_input_5","label":"This is a text input that only uses `allowed-pattern` to prevent users from entering input other than numbers 1 - 7. See http://www.html5pattern.com/ for more examples of patterns.","type":"text","errorMessage":"","required":false,"disabled":true,"hidden":false,"invalid":false,"incomplete":false,"value":"353","allowedPattern":"[1-7]","tagName":"TANGY-INPUT"},{"name":"checkbox_1","required":false,"disabled":true,"invalid":false,"incomplete":false,"hidden":false,"value":true,"tagName":"TANGY-CHECKBOX"},{"name":"checkbox_2","required":true,"disabled":true,"invalid":false,"incomplete":false,"hidden":false,"value":true,"tagName":"TANGY-CHECKBOX"},{"name":"checkbox_3","required":true,"disabled":true,"invalid":false,"incomplete":true,"hidden":false,"value":"","tagName":"TANGY-CHECKBOX"},{"name":"checkbox_4","required":false,"disabled":true,"invalid":false,"incomplete":true,"hidden":false,"value":"","tagName":"TANGY-CHECKBOX"},{"name":"checkbox_5","required":true,"disabled":true,"invalid":false,"incomplete":true,"hidden":true,"value":"","tagName":"TANGY-CHECKBOX"},{"name":"checkbox_6","required":false,"disabled":true,"invalid":false,"incomplete":true,"hidden":false,"value":"","tagName":"TANGY-CHECKBOX"},{"name":"checkbox_group_1","value":["checkbox_group_1__checkbox_2"],"atLeast":0,"required":false,"disabled":true,"label":"This is a checkbox group.","hidden":false,"incomplete":false,"invalid":false,"tagName":"TANGY-CHECKBOXES"},{"name":"checkbox_group_2","value":["checkbox_group_2__checkbox_1","checkbox_group_2__checkbox_2","checkbox_group_2__checkbox_3"],"atLeast":0,"required":true,"disabled":true,"label":"This is a checkbox group that requires that it be saved with at least 1 checked checkbox.","hidden":false,"incomplete":false,"invalid":false,"tagName":"TANGY-CHECKBOXES"},{"name":"checkbox_group_3","value":["checkbox_group_3__checkbox_2"],"atLeast":2,"required":false,"disabled":true,"label":"This is a checkbox group that is not required, but if you do make a selection it is not valid until you check at least 2 checkboxes.","hidden":false,"incomplete":true,"invalid":false,"tagName":"TANGY-CHECKBOXES"},{"name":"checkbox_group_4","value":["checkbox_group_4__checkbox_3"],"atLeast":0,"required":true,"disabled":true,"label":"This is a disabled checkbox group.","hidden":false,"incomplete":false,"invalid":false,"tagName":"TANGY-CHECKBOXES"},{"name":"checkbox_group_4_enable","required":false,"disabled":true,"invalid":false,"incomplete":false,"hidden":false,"value":true,"tagName":"TANGY-CHECKBOX"},{"name":"checkbox_group_5","value":["checkbox_group_5__checkbox_2","checkbox_group_5__checkbox_3"],"atLeast":0,"required":true,"disabled":true,"label":"This is a hidden checkbox group.","hidden":false,"incomplete":false,"invalid":false,"tagName":"TANGY-CHECKBOXES"},{"name":"checkbox_group_5_show","required":false,"disabled":true,"invalid":false,"incomplete":false,"hidden":false,"value":true,"tagName":"TANGY-CHECKBOX"},{"name":"radio_buttons_1","value":"","required":false,"disabled":true,"label":"These are radio buttons.","hidden":false,"invalid":false,"incomplete":true,"tagName":"TANGY-RADIO-BUTTONS"},{"name":"radio_buttons_2","value":"apple","required":true,"disabled":true,"label":"These are radio buttons where at least one selection is required.","hidden":false,"invalid":false,"incomplete":false,"tagName":"TANGY-RADIO-BUTTONS"},{"name":"radio_buttons_3","value":"coconut","required":true,"disabled":true,"label":"These are radio buttons that are disabled. If enabled, then a selection is required.","hidden":false,"invalid":false,"incomplete":false,"tagName":"TANGY-RADIO-BUTTONS"},{"name":"radio_buttons_3_enable","required":false,"disabled":true,"invalid":false,"incomplete":false,"hidden":false,"value":true,"tagName":"TANGY-CHECKBOX"},{"name":"radio_buttons_4","value":"","required":true,"disabled":true,"label":"These are radio buttons that are hidden. If not hidden, then a selection is required.","hidden":true,"invalid":false,"incomplete":true,"tagName":"TANGY-RADIO-BUTTONS"},{"name":"radio_buttons_4_show","required":false,"disabled":true,"invalid":false,"incomplete":true,"hidden":false,"value":"","tagName":"TANGY-CHECKBOX"},{"name":"location","value":[{"level":"county","value":"county1"},{"level":"school","value":"school1"}],"label":"Select your school","required":true,"invalid":false,"locationSrc":"../location-list.json","showLevels":"county,school","hidden":false,"disabled":true,"tagName":"TANGY-LOCATION","incomplete":false},{"name":"class1_term2","value":["class1_term2-2","class1_term2-3","class1_term2-6","class1_term2-11","class1_term2-31"],"mode":"TANGY_TIMED_MODE_LAST_ATTEMPTED","duration":60,"columns":4,"invalid":false,"incomplete":false,"required":true,"lastAttempted":"class1_term2-32","timeSpent":5,"tagName":"TANGY-TIMED","disabled":true},{"name":"gps-coords","value":{"recordedLatitude":44.451448899999995,"recordedLongitude":-73.22411939999999,"recordedAccuracy":70},"tagName":"TANGY-GPS","invalid":false,"incomplete":false,"disabled":true}],"focusIndex":5,"nextFocusIndex":-1,"previousFocusIndex":4,"startDatetime":"1/31/2018, 8:53:29 PM","startUnixtime":1517450009259,"uploadDatetime":"","previousItemId":"item_5","progress":0,"complete":true,"_id":"993b5d56-da02-48cf-8189-3d42baa5114d","_rev":"77-5f6b79e709f2493387992163a75d53a3"}
  delete template._rev
  let i = 0
  while (i <= parseInt(req.params.numberOfResponses)) {
    await db.put(Object.assign({} , template, { _id: crypto.randomBytes( 20 ).toString('hex') }))
    i++
  }
  res.send('ok')
})
