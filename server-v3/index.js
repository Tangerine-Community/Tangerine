/* jshint esversion: 6 */
const http = require('axios');
const Conf = require('./Conf');
const read = require('read-yaml')
const express = require('express')
const path = require('path')
const app = express()
const fs = require('fs-extra')
const config = read.sync('./config.yml')
const sanitize = require('sanitize-filename');
const cheerio = require('cheerio');
// for json parsing in received requests
const bodyParser = require('body-parser');
// basic logging
const requestLogger = require('./middlewares/requestLogger');
const User = require('../server/User');
let crypto = require('crypto');

const sep = path.sep;
const DB_URL = `${config.protocol}${config.domain}:${config.port}${config.dbServerEndpoint}`
const DB_ADMIN_URL = `${config.protocol}${config.admin.username}:${config.admin.password}@${config.domain}:${config.port}${config.dbServerEndpoint}`

app.use(bodyParser.json()); // use json
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
// app.use(requestLogger);     // uncomment this line to add some logging

console.log("launching server.")

app.use('/', express.static(path.join(__dirname, '../client-v3/tangy-forms/editor')));
app.use('/groups', express.static(path.join(__dirname, '../client-v3/content/groups')));
app.use('/:group/tangy-forms/', express.static(path.join(__dirname, '../client-v3/builds/dev/tangy-forms/')));
app.use('/:group/ckeditor/', express.static(path.join(__dirname, '../client-v3/ckeditor/')));

app.use('/:group/content', function (req, res, next) {
  let contentPath = '../client-v3/content/groups/' + req.params.group
  console.log("Setting path to " + path.join(__dirname, contentPath))
  return express.static(path.join(__dirname, contentPath)).apply(this, arguments);
});

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
      "title": formTitle,
      "src": contentUrlPath + formDirName + "/form.html"
    }
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

app.post('/group/new', async function (req, res) {
  const contentRoot = config.contentRoot
  const editorTemplatesRoot = config.editorClientTemplates
  console.log("body: " + JSON.stringify(req.body))
  let groupName = req.body.groupName
  console.log("groupName: " + groupName)
  console.log("checking contentRoot + sep + formDir: " + contentRoot + sep + groupName)

  // Creates the upload user on the CouchDB
  async function makeUploader(groupName){
    const uploaderPassword = crypto.randomBytes( 20 ).toString('hex');
    let userAttributes = {
      name     : 'uploader-' + groupName,
      password : uploaderPassword
    };
    new User(userAttributes).create();
    return userAttributes
    // todo: create app-config.json, security doc for database r/w perms
  }

  // Set up the group database.
  try {
    let groupCouch = Conf.calcGroupUrl(groupName)
    console.log("groupCouch: " + groupCouch)
    await http.put(groupCouch);
    console.log("App database created for " + groupName);
  }
  catch (err) {
    console.log("We already have an app database.");
  }

  // Set up the group reporting database.

  const groupNameReports = groupName + '_reporting';
  try {
    let groupCouch = Conf.calcGroupUrl(groupNameReports)
    console.log("groupCouch: " + groupCouch)
    await http.put(groupCouch);
    console.log("Reporting database created:" + groupNameReports);
  }
  catch (err) {
    console.log("We already have an app database.");
  }

  let userAttributes, username, password, appConfig
  try {
    userAttributes = await makeUploader(groupName)
    username = userAttributes.name
    password = userAttributes.password
  }
  catch (err) {
    console.log("Error: " + err);
  }
  await fs.ensureDir(contentRoot + sep + groupName)
  await saveFormsJson(null, groupName)
    .then(() => {
      console.log("Created forms.json")
    })
    .catch(err => {
      console.error("An error saving the json form: " + err)
      throw err;
    })
  try {
    appConfig = await fs.readFile(editorTemplatesRoot + sep + 'app-config-template.json', "utf8",)
    let search = 'admin:password'
    let userPass = username + ':' + password
    appConfig = appConfig.replace(search , userPass)
  } catch (err) {
    console.error("An error copying location-list: " + err)
    throw err;
  }

   await fs.writeFile(contentRoot + sep + groupName + sep + 'app-config.json', appConfig)
    .then((locationList) => {
      console.log("Wrote app-config.json")
    })
    .catch(err => {
      console.error("An error copying app-config: " + err)
      throw err;
    })

  const securityDoc = {
    admins: {
      names : [],
      roles : [`admin-${groupName}`] // for use on the server
    },
    members: {
      names : [`uploader-${groupName}`], // used by the tablets for write access
      roles : [`member-${groupName}`] // for use on the server
    }
  };

  const securityGroupUrl = Conf.calcSecurityUrl(groupName)
  const securityGroupReportsUrl = Conf.calcSecurityUrl(groupNameReports)

  await http.put(securityGroupUrl, securityDoc)
    .then(function(){ console.log("Security doc created for group: " + groupName)} )
    .catch(function (error) {
    console.log("error: " + error)
  });

  await http.put(securityGroupReportsUrl, securityDoc)
    .then(function(){ console.log("Security doc created for group reporting:" + groupNameReports)} )
    .catch(function (error) {
    console.log("error: " + error)
  });

  await fs.copy(editorTemplatesRoot + sep +  'location-list.json', contentRoot + sep + groupName + sep + 'location-list.json', {overwrite:false} )
    .then(() => {
      console.log("Copied location-list.json")
    })
    .catch(err => {
      console.error("An error copying location-list: " + err)
      throw err;
    })

  res.redirect('/editor/' + groupName + '/tangy-forms/editor.html')
  // res.sendStatus(200)
})

// kick it off
var server = app.listen(config.port, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('Server V3: http://%s:%s', host, port);
});

