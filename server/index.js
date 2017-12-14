/* jshint esversion: 6 */

const http = require('axios')
const read = require('read-yaml')
const PouchDB = require('pouchdb')
const express = require('express')
const path = require('path')
const app = express()
const fauxton = express()
const fs = require('fs-extra')
const config = read.sync('./config.yml')
const editor = require('./editor.js')()
const sanitize = require('sanitize-filename');
const cheerio = require('cheerio');
// for json parsing in recieved requests
const bodyParser = require('body-parser');

const sep = path.sep;
const DB_URL = `${config.protocol}${config.domain}:${config.port}${config.dbServerEndpoint}`
const DB_ADMIN_URL = `${config.protocol}${config.admin.username}:${config.admin.password}@${config.domain}:${config.port}${config.dbServerEndpoint}`

app.use(bodyParser.json()); // use json

// Database at /db/*
app.use(config.dbServerEndpoint, require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})))

// Content at /content/*
app.use('/content', express.static(path.join(__dirname, config.contentRoot)))

// If we are in DEBUG mode, then glue together various dev folders into a structure that reperesents the paths of what they would be built else 
// mount the client build folder and don't worry about it.
if (process.env.DEBUG) {
  // Shell at /tangerine/*
  app.use('/tangerine', express.static(path.join(__dirname, '../client/shell/dist')));
  // Tangy Forms at /tangy-forms/*
  app.use('/tangy-forms', express.static(path.join(__dirname, '../client/tangy-forms/dist')));
  // App updater at /*
  app.use('/', express.static(path.join(__dirname, '../client/app-updater')));
} else {
  app.use('/', express.static(path.join(__dirname, '../client/build')));
}

// editor

app.use('/tangy-editor', express.static(path.join(__dirname, '../client/tangy-forms/editor')));

app.get('/project/listAll', function (req, res, next) {

  // var editorO = editor

  var dirs = editor.listProjects().then(function (result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function (err) {
    console.log(err); // Error: "It broke"
  });
  // return next();
});
//
// // Creates a new form
// server.post('/editor/form/create', async function (req, res) {
//   console.log("req.body:" + JSON.stringify(req.body));
//   let safeFileName = sanitize(req.body.file_name);
//   let safeTitle = sanitize(req.body.title);
//   let projectName = req.params.projectName
//
//   let safeItemTitle = sanitize(req.body.itemTitle)
//   let formDirName = req.body.formName
//   let contentRoot = config.contentRoot
//   let formDir, formName, originalForm, formPath
//
//   let dir = projectRoot + projectName;
//   let exists = await fs.pathExists(dir)
//   console.log("pathExists:" + exists)
//   if (exists !== true) {
//     res.send(new Error('Error: Project does not exist: ' + projectName));
//   } else {
//
//     let formParameters = {
//       "title": safeTitle,
//       "src": "forms/" + safeFileName + "/form.html"
//     }
//     await saveFormsJson(dir, formParameters);
//
//     let srcpath = "../tangerine-forms/forms/editor";
//     let formTemplate = await fs.readFile(srcpath + "/form-template.html","utf8")
//     console.log("formTemplate: " + formTemplate)
//     // let formTemplateStr = JSON.stringify(formTemplate)
//     let form = formTemplate.replace("FORMNAME", safeFileName)
//
//     let resp = await saveForm(dir, safeFileName, form);
//     res.send(resp)
//   }
//   return next()
// })

  async function saveFormsJson(formParameters, project) {
    console.log("formParameters: " + JSON.stringify(formParameters))
    let contentRoot = config.contentRoot
    let formsJsonPath = contentRoot + '/forms.json'
    console.log("formsJsonPath:" + formsJsonPath)
    let formJson
    try {
      await fs.ensureFile(formsJsonPath)
      console.log("formsJsonPath exists")
    } catch (err) {
      console.log("Creating empty formJson array" + err)
      formJson = []
    }
    try {
      formJson = await fs.readJson(formsJsonPath)
      console.log("formJson: " + JSON.stringify(formJson))
      console.log("formParameters: " + JSON.stringify(formParameters))
      formJson.push(formParameters)
      console.log("formJson with new formParameters: " + JSON.stringify(formJson))
    } catch (err) {
      console.error("An error reading the json form: " + err)
    }
    await fs.writeJson(formsJsonPath, formJson)
  }

// Saves an item - and a new form when formName is passed.
// otherwise, the path to the existing form is extracted from formHtmlPath.
app.post('/editor/item/save', async function (req, res) {
  let displayFormsListing = false
  console.log("req.body:" + JSON.stringify(req.body) + " req.body.itemTitle: " + req.body.itemTitle)
  let formTitle = req.body.formTitle
  if (typeof formTitle !== 'undefined') {
    formTitle = sanitize(formTitle)
  }
  let itemTitle = req.body.itemTitle
  if (typeof itemTitle !== 'undefined') {
    itemTitle = sanitize(itemTitle)
  }
  let formDirName = req.body.formName
  console.log("formDirName: "+ formDirName)
  if (typeof formDirName !== 'undefined') {
    formDirName = sanitize(req.body.formName).replace(/ /g,'')
  }
  let itemHtmlText = req.body.itemHtmlText
  let formHtmlPath = req.body.formHtmlPath
  let itemFilename = req.body.itemFilename
  let projectName = req.body.projectName
  let itemId = req.body.itemId
  let contentRoot = config.contentRoot
  let formDir, formName, originalForm, formPath

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
    originalForm.replace('FORMNAME', formDirName)
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
      "title": formTitle,
      "src": formDirName + "/form.html"
    }
    await saveFormsJson(formParameters, null)
      .then(() => {
        console.log("Updated forms.json")
      })
      .catch(err => {
        console.error("An error saving the json form: " + err)
        throw err;
      })
    // Set formPath
    formPath = contentRoot + sep + formDir + sep + formName
  } else {
    formDir = formHtmlPath.split('/')[2]
    formName = formHtmlPath.split('/')[3]
    // let dir = projectRoot + projectName;
    // open the form and parse it
    formPath = contentRoot + sep + formDir + sep + formName
    try {
      originalForm = await fs.readFile(formPath,'utf8')
    } catch (e) {
      console.log("Error opening originalForm: " , e);
    }
    console.log("originalForm: " + JSON.stringify(originalForm))
  }

  // Now that we have originalForm, we can load it and add items to it.
  const $ = cheerio.load(originalForm)
  // search for tangy-form-item
  let formItemList = $('tangy-form-item')
  // let html = $.html('tangy-form-item')
  // console.log("html before: " + $.html())
  let clippedFormItemList = formItemList.not(function(i, el) {
    // this === el
    let id = $(this).attr('id')
    let src = $(this).attr('src')
    return src === itemFilename
  })
  // console.log('formItemList: ' + formItemList.length + ' clippedFormItemList: ' + clippedFormItemList.length)

  // create the form html that will be added
  let newForm = '<tangy-form-item src="' + itemFilename + '" id="' + itemId + '" title="' + itemTitle + '">'
  console.log('newForm: ' + newForm)
  $('tangy-form-item').remove()
  // todo: resolve ordering of these elements.
  $(clippedFormItemList).appendTo('tangy-form')
  $(newForm).appendTo('tangy-form')
  // console.log('html after: ' + $.html())
  let form = $.html()
  // await editor.saveForm(formPath, form);
  console.log('now outputting ' + formPath)
  await fs.outputFile(formPath, form)
    .then(() => {
      console.log('success! Updated file at: ' + formPath)

    })
    .catch(err => {
      console.error("An error with form outputFile: " + err)
      res.send(err)
    })
  // let resp =  await editor.saveItem(formPath, itemFilename, itemHtmlText)
  let itemPath = formPath.substring(0, formPath.lastIndexOf("/")) + sep + itemFilename;
  console.log("Saving item at : " + itemPath)
  await fs.outputFile(itemPath, itemHtmlText)
    .then(() => {
      console.log('success! Created item at: ' + itemPath)
    })
    .catch(err => {
      console.error("An error with item outputFile: " + err)
      res.send(err)
    })
  let resp = {
    "message": 'Item saved: ' + itemPath,
    "displayFormsListing":displayFormsListing
  }
  console.log("resp: "+  JSON.stringify(resp))
  res.json(resp)

})

// Bind the app to port 80.
app.listen(config.port);

// Setup fauxton on port 5984 at root path because it will only work there due to some hardcoded expectations in the Fauxton JS.
fauxton.use(require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));
fauxton.listen(5984);

// Setup database.
async function setup() {

  // Set up the admin user.
  try {
    await http.put(`${DB_URL}/_config/admins/${config.admin.username}`, `"${config.admin.password}"`, {headers: {}});
    console.log("Admin created.");
  }
  catch (err) {
    console.log("We already have admins.");
  }

  // Set up the app database.
  try {
    await http.put(`${DB_ADMIN_URL}/tangerine`);
    console.log("Todos database created.");
  }
  catch (err) {
    console.log("We already have an app database.");
  }

}

setup();

