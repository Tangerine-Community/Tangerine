const restify = require('restify');
const plugins = require('restify-plugins');
const CookieParser = require('restify-cookies');
const sanitize = require('sanitize-filename');
const fs = require('fs-extra');
const { join } = require('path')
// for cookie authorization
const couchAuth = require('../../middlewares/couchAuth');
const Logger = require('bunyan');
const Dat = require('dat-node')
const cheerio = require('cheerio');
var log = new Logger({
    name: 'raisin',
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path: 'raisin.log',
            level: 'trace'
        }
    ],
    serializers: restify.bunyan.serializers,
});

const server = restify.createServer({
  name: 'raisin',
  version: '1.0.0',
  log: log   // Pass our logger to restify.
});

let PORT = '3000';
let projectRoot = '../projects/projects/';

server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser({ mapParams: true }));
server.use(CookieParser.parse);
server.use(couchAuth);         // use couchdb cookie authentication
server.use(restify.CORS({

    // Defaults to ['*'].
    // origins: ['https://foo.com', 'http://bar.com', 'http://baz.com:8081'],
    origins: ['*'],

    // Defaults to false.
    credentials: false,

    // Sets expose-headers.
    headers: ['x-foo']

}));

server.pre(function (request, response, next) {
    request.log.info({req: request}, 'start');        // (1)
    return next();
});

server.on('after', function (req, res, route) {
    req.log.info({res: res}, "finished");             // (3)
});

server.get('/', function (req, res, next) {
  res.send('Server is running');
  return next();
});


// kudos: https://stackoverflow.com/questions/45293969/waiting-for-many-async-functions-execution
let readFiles = ()=>{
    var dir = projectRoot;
    // const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory())
    const isDirectory = source => fs.lstatSync(source).isDirectory()
    const getDirectories = source =>
        fs.readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    let dirList = getDirectories(dir);
    let contents = {};
    let promises = dirList
        .map(path => fs.readJson(path + '/metadata.json').catch(err => {
            console.error(err) // Not called
          })
        );
    return Promise.all(promises);
}

function listProjects() {
  return new Promise((resolve, reject) => {
    console.log("listing projects.")
    readFiles()
      .then(contents => {
        // console.log("contents: " + JSON.stringify(contents))
        // contents = contents.filter(function(n){ console.log("n is: " + JSON.stringify(n) + " type: " + typeof n);return typeof n == 'object' });
        contents = contents.filter(function(n){ return typeof n == 'object' });
        console.log("contents : " + JSON.stringify(contents))

        resolve(contents)
        return contents
      })
      .catch(error => {
        console.log("bummer: " + error)
        reject(contents)
      });
  });
}

server.get('/project/listAll', function (req, res, next) {

  var dirs = listProjects().then(function(result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  // readFiles()
  //     .then(contents => {
  //         console.log("contents: " + JSON.stringify(contents))
  //         res.send(contents);
  //     })
  //     .catch(error => {
  //         console.log("bummer: " + error)
  //
  //     });

  return next();
});

// file: 'build/default/index.html'

server.get(/\/projects\/?.*/, restify.plugins.serveStatic({
  directory: '../projects',
  default: 'index.html',
  maxAge: 0
}));

server.get(/\/tangy\/?.*/, restify.plugins.serveStatic({
  directory: '../app',
  default: 'index.html',
  maxAge: 0
}));

server.post('/writeFile', async function (req, res, next) {
    console.log("req.params:" + JSON.stringify(req.params));
    let html = req.params.html
    let project = req.params.project
    let filePath = req.params.filePath
    let safeProjectName = sanitize(project);
    let dir = projectRoot + safeProjectName + "/content/" + filePath
        fs.outputFile(dir, html).then(() => {
            let resp = {
                "message": 'File created: ' + filePath
            }
            res.send(resp);
        }).catch(() => {
            res.send(new Error('Error: Directory not created: ' + dir));
        })
})

server.post('/mkDir', async function (req, res, next) {
    console.log("req.params:" + JSON.stringify(req.params));
    let project = req.params.project
    let dirName = req.params.dirName
    let safeProjectName = sanitize(project);
    let dir = projectRoot + safeProjectName + "/content/" + dirName
    fs.pathExists(dir)
        .then((exists) => {
            console.log("pathExists:" + exists)
            if (exists == true) {
                res.send(new Error('Error: Directory already exists: ' + dirName));
            } else {
                fs.ensureDir(dir).then(() => {
                    let resp = {
                        "message": 'Directory created: ' + dirName
                    }
                    res.send(resp);
                })
            }
        })
})

server.post('/project/create', async function (req, res, next) {
  console.log("req.params:" + JSON.stringify(req.params));
  var safeProjectName = sanitize(req.params.projectName);
  let dir = projectRoot + safeProjectName;
  fs.pathExists(dir)
    .then((exists) => {
      console.log("pathExists:" + exists)
      if (exists == true) {
        res.send(new Error('Error: Project already exists: ' + req.params.projectName));
      } else {
        fs.ensureDir(dir).then(() => {
          let contentPath = dir + "/content";
          fs.ensureDir(contentPath + "/forms").then(() => {
            let srcpath = "../tangerine-forms";
            let dstpath = dir + "/client";
            fs.ensureSymlink(srcpath, dstpath).then(() => {
              var mirrorOpts = {
                watch: true,
                ignoreDirs: false,
                live: true,
                dereference: true
              };
              fs.copy(srcpath + "/index.html", contentPath + "/index.html").then(() => {
                let formsJsonSrc = srcpath + "/forms/editor/forms.json";
                let formsJsonDest = dir + "/content/forms.json";
                fs.copy(formsJsonSrc, formsJsonDest).then(() => {
                  Dat(dir, mirrorOpts, function (err, dat) {
                    if (err) throw err

                    var network = dat.joinNetwork()
                    network.once('connection', function () {
                      console.log('Connected')
                    })
                    var importer = dat.importFiles(mirrorOpts)
                    let datKey =  dat.key.toString('hex');
                    console.log('My Dat link is: dat://' + datKey);
                    let metadata = {
                      "datKey": datKey,
                      "projectName": req.params.projectName
                    };
                    fs.writeJson(dir + '/metadata.json', metadata).then(() => {
                        // let dirs = listProjects();
                        let list = listProjects().then(function(dirs) {
                          console.log("dirs: " + JSON.stringify(dirs)); // "Stuff worked!"
                          let resp = {
                            "dirs": dirs,
                            "datKey": datKey,
                            "message": 'Project created: ' + req.params.projectName
                          }
                          res.send(resp);
                        }, function(err) {
                          console.log(err); // Error: "It broke"
                        });
                      }
                    ).catch(err => {
                      console.error("Error writing json: " + err)
                    })
                    dat.network.on('connection', function () {
                      console.log('I connected to someone!')
                    })
                    importer.on('put', function (src, dest) {
                      console.log('Importing ', src.name, ' into archive dest: ' + dest.name)
                    })
                    importer.on('skip', function (src, dest) {
                      console.log('Skipping ', src.name, ' into archive dest: ' + dest.name)
                    })
                    importer.on('error', function (err) {
                      console.log('Error:  ', err)
                    })
                  });
                });
              });
            })
          })
        })
      }
    })
  return next();
});



/**
 * Reads current form.json and adds new form params to it, then saves.
 * @param dir
 * @param formParameters
 * @returns {Promise.<void>}
 */
let saveFormsJson = async function (dir, formParameters) {
  let formsPath = dir + "/content/forms";
  await fs.ensureDir(formsPath)
  let formsJsonPath = dir + "/content/forms.json";
  let currentFormJson = await fs.readJson(formsJsonPath)
  currentFormJson.push(formParameters)
  console.log("currentFormJson with metadata: " + JSON.stringify(currentFormJson))
  // fs.writeJson(formsJsonPath, packageObj).then(() => {
  await fs.writeJson(formsJsonPath, packageObj)
};

/**
 * Saves a form at projects/projectName/content/forms/formName/form.html
 * @param dir
 * @param safeFiletName
 * @param form
 * @returns {Promise.<{message: string}>}
 */
let saveForm = async function (dir, formName, form) {
  let formPath = dir + "/content/forms/" + formName;
  await fs.ensureDir(formPath)
  await fs.outputFile(formPath + "/form.html", form)
  let resp = {
    "message": 'Form saved: ' + formPath
  }
  return resp;
};

/**
 * Saves an item at projects/projectName/content/forms/formName/itemName.html
 * @param dir
 * @param formName
 * @param itemFilename
 * @param itemHtmlText
 * @returns {Promise.<{message: string}>}
 */
let saveItem = async function (dir, formName, itemFilename, itemHtmlText) {
  let itemPath = dir + "/content/forms/" + formName + "/" + itemFilename;
  await fs.outputFile(itemPath, itemHtmlText)
  let resp = {
    "message": 'Item saved: ' + itemPath
  }
  return resp;
};

server.post('/form/create', async function (req, res, next) {
  console.log("req.params:" + JSON.stringify(req.params));
  let safeFileName = sanitize(req.params.file_name);
  let safeTitle = sanitize(req.params.title);
  let projectName = req.params.projectName
  let dir = projectRoot + projectName;
  let exists = await fs.pathExists(dir)
  console.log("pathExists:" + exists)
  if (exists !== true) {
    res.send(new Error('Error: Project does not exist: ' + projectName));
  } else {

    let formParameters = {
      "title": safeTitle,
      "src": "forms/" + safeFileName + "/form.html"
    }
    await saveFormsJson(dir, formParameters);

    let srcpath = "../tangerine-forms/forms/editor";
    let formTemplate = await fs.readFile(srcpath + "/form-template.html","utf8")
    console.log("formTemplate: " + formTemplate)
    // let formTemplateStr = JSON.stringify(formTemplate)
    let form = formTemplate.replace("FORMNAME", safeFileName)

    let resp = await saveForm(dir, safeFileName, form);
    res.send(resp)
  }
  return next()
})
server.post('/item/save', async function (req, res, next) {
  // console.log("req.params:" + JSON.stringify(req.params))
  let safeItemTitle = sanitize(req.params.itemTitle)
  let itemOrder = req.params.itemOrder
  let itemHtmlText = req.params.itemHtmlText

  let formHtmlPath = req.params.formHtmlPath
  let itemFilename = req.params.itemFilename
  let projectName = req.params.projectName
  let itemId = req.params.itemId
  // "formHtmlPath":"forms/lemmie/form.html","itemEditSrc":"item-1.html","itemId":"item-1","itemTitle":"ACASI Part 3: Introduction"}
  let formName = formHtmlPath.split('/')[1]
  let dir = projectRoot + projectName;
  // open the form and parse it
  let formPath = dir + "/content/forms/" + formName + "/form.html"
  let originalForm = await fs.readFile(formPath,'utf8')
  const $ = cheerio.load(originalForm)
  // search for tangy-form-item
  let formItemList = $('tangy-form-item')
  // console.log('formItemList: ' + JSON.stringify(formItemList))
  // let html = $.html('tangy-form-item')
  console.log("*********************")
  console.log("html before: " + $.html())
  console.log("*********************")
  // html: <tangy-form-item src="item-1.html" id="item-1" title="ACASI Part 3: Introduction"></tangy-form-item><tangy-form-item src="item-2.html" id="item-2" title="Question 1"></tangy-form-item>
  // formItemList.each(function(i, elem) {
  //   let id = $(this).attr("id")
  //   let src = $(this).attr("src")
  //
  //   console.log('id: ' + id + ' src: ' + src +  ' itemFilename: ' + itemFilename)
  //   if (src === itemFilename) {
  //     console.log('matched ' + id + " order: " + i)
  //   }
  // });
  let clippedFormItemList = formItemList.not(function(i, el) {
    // this === el
    let id = $(this).attr('id')
    let src = $(this).attr('src')
    return src === itemFilename
  })
  console.log('formItemList: ' + formItemList.length + ' clippedFormItemList: ' + clippedFormItemList.length)

  // create the form html that will be added
  let newForm = '<tangy-form-item src="' + itemFilename + '" id="' + itemId + '" title="' + safeItemTitle + '" itemOrder="' + itemOrder + '">'
  console.log('newForm: ' + newForm)
  $('tangy-form-item').remove()
  // todo: resolve ordering of these elements.
  $(newForm).appendTo('tangy-form')
  $(clippedFormItemList).appendTo('tangy-form')
  console.log("*********************")
  console.log('html after: ' + $.html())
  console.log("*********************")
  let form = $.html()
  await saveForm(dir, formName, form);
  let resp = await saveItem(dir, formName, itemFilename, itemHtmlText)
  // let resp = {
  //   "message": 'Its OK '
  // }
  res.send(resp)
  return next()
})

server.listen(PORT, function () {
  console.log('server is up!');
  console.log('%s listening at %s', server.name, server.url);
})

