var http = require('axios')
var read = require('read-yaml')
var PouchDB = require('pouchdb')
var express = require('express')
var path = require('path')
var app = express()
var fauxton = express()
var fs = require('fs-extra')
var config = read.sync('./config.yml')
var editor = require('./editor.js')
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

  // var editorO = editor()

  var dirs = editor().listProjects().then(function (result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function (err) {
    console.log(err); // Error: "It broke"
  });
  // return next();
});

app.post('/editor/item/save', async function (req, res, next) {
  // console.log("req.body:" + JSON.stringify(req.body) + " req.body.itemTitle: " + req.body.itemTitle)
  let safeItemTitle = sanitize(req.body.itemTitle)
  let itemHtmlText = req.body.itemHtmlText
  let formHtmlPath = req.body.formHtmlPath
  let itemFilename = req.body.itemFilename
  let projectName = req.body.projectName
  let itemId = req.body.itemId
  let formDir = formHtmlPath.split('/')[2]
  let formName = formHtmlPath.split('/')[3]
  // let dir = projectRoot + projectName;
  let dir = config.contentRoot
  // open the form and parse it
  let formPath = dir + sep + formDir + sep + formName
  let originalForm
  try {
    originalForm = await fs.readFile(formPath,'utf8')
  } catch (e) {
    console.log('e', e);
  }
  console.log("originalForm: " + JSON.stringify(originalForm))
  const $ = cheerio.load(originalForm)
  // search for tangy-form-item
  let formItemList = $('tangy-form-item')
  // let html = $.html('tangy-form-item')
  console.log("*********************")
  console.log("html before: " + $.html())
  console.log("*********************")
  let clippedFormItemList = formItemList.not(function(i, el) {
    // this === el
    let id = $(this).attr('id')
    let src = $(this).attr('src')
    return src === itemFilename
  })
  console.log('formItemList: ' + formItemList.length + ' clippedFormItemList: ' + clippedFormItemList.length)

  // create the form html that will be added
  let newForm = '<tangy-form-item src="' + itemFilename + '" id="' + itemId + '" title="' + safeItemTitle + '">'
  console.log('newForm: ' + newForm)
  $('tangy-form-item').remove()
  // todo: resolve ordering of these elements.
  $(clippedFormItemList).appendTo('tangy-form')
  $(newForm).appendTo('tangy-form')
  console.log("*********************")
  console.log('html after: ' + $.html())
  console.log("*********************")
  let form = $.html()
  await editor().saveForm(formPath, form);
  let resp = await editor().saveItem(formPath, itemFilename, itemHtmlText)
  res.send(resp)
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

