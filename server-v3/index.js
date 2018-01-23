/* jshint esversion: 6 */

// const http = require('axios')
const read = require('read-yaml')
// const PouchDB = require('pouchdb')
const express = require('express')
const path = require('path')
const app = express()
// const fauxton = express()
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
// app.use(config.dbServerEndpoint, require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})))

// Content at /content/*
// app.use('/content', express.static(path.join(__dirname, config.contentRoot)))

// If we are in DEBUG mode, then glue together various dev folders into a structure that reperesents the paths of what they would be built else 
// mount the client build folder and don't worry about it.
// if (process.env.DEBUG) {
//   // Shell at /tangerine/*
//   app.use('/tangerine', express.static(path.join(__dirname, '../client/shell/dist')));
//   // Tangy Forms at /tangy-forms/*
//   app.use('/tangy-forms', express.static(path.join(__dirname, '../client/tangy-forms/dist')));
//   // App updater at /*
//   app.use('/', express.static(path.join(__dirname, '../client/app-updater')));
// } else {
//   app.use('/', express.static(path.join(__dirname, '../client/build')));
// }

// editor

// app.use('/tangy-editor', express.static(path.join(__dirname, '../client-v3/tangy-forms/editor')));

console.log("launching server.")

app.get('/editor/project/listAll', function (req, res, next) {
  var dirs = editor.listProjects().then(function (result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function (err) {
    console.log(err); // Error: "It broke"
  });
});

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

app.post('/itemsOrder/save', async function (req, res) {
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
app.post('/item/save', async function (req, res) {
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
  let projectName = req.body.projectName
  let itemId = req.body.itemId
  let contentRoot = config.contentRoot
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
      "title": formTitle,
      "src": contentUrlPath + formDirName + "/form.html"
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
  }
  // Save the item
  // let resp =  await editor.saveItem(formPath, itemFilename, itemHtmlText)
  let itemPath = formPath.substring(0, formPath.lastIndexOf("/")) + sep + itemFilename;
  // console.log("Saving item at : " + itemPath)
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

// Bind the app to port 80.
app.listen(config.port);

// Setup fauxton on port 5984 at root path because it will only work there due to some hardcoded expectations in the Fauxton JS.
// fauxton.use(require('express-pouchdb')(PouchDB.defaults({prefix: './db/'})));
// fauxton.listen(5984);

// Setup database.
// async function setup() {
//
//   // Set up the admin user.
//   try {
//     await http.put(`${DB_URL}/_config/admins/${config.admin.username}`, `"${config.admin.password}"`, {headers: {}});
//     console.log("Admin created.");
//   }
//   catch (err) {
//     console.log("We already have admins.");
//   }
//
//   // Set up the app database.
//   try {
//     await http.put(`${DB_ADMIN_URL}/tangerine`);
//     console.log("Todos database created.");
//   }
//   catch (err) {
//     console.log("We already have an app database.");
//   }
//
// }
//
// setup();

