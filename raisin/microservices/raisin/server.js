
var restify = require('restify');
var plugins = require('restify-plugins');
var CookieParser = require('restify-cookies');
var sanitize = require("sanitize-filename");
const fs = require('fs-extra');
const { join } = require('path')
// for cookie authorization
const couchAuth = require('../../middlewares/couchAuth');
var Logger = require('bunyan');
var Dat = require('dat-node')
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
        .map(path => fs.readJson(path + '/metadata.json'));
    return Promise.all(promises);
}

let listProjects = new Promise((resolve, reject) => {

        readFiles()
            .then(contents => {
                console.log("contents: " + JSON.stringify(contents))
                resolve(contents)
                return contents
            })
            .catch(error => {
                console.log("bummer: " + error)
                reject(contents)
            });
    });


server.get('/project/listAll', function (req, res, next) {

    // let dirs = listProjects.then(function(result) {
    //     console.log(result); // "Stuff worked!"
    //     res.send(dirs);
    // }, function(err) {
    //     console.log(err); // Error: "It broke"
    // });

    readFiles()
        .then(contents => {
            console.log("contents: " + JSON.stringify(contents))
            res.send(contents);
        })
        .catch(error => {
            console.log("bummer: " + error)

        });

    return next();
});

// file: 'build/default/index.html'

server.get(/\/projects\/?.*/, restify.plugins.serveStatic({
  directory: '../projects',
  default: 'index.html',
  maxAge:0
}));

server.get(/\/tangy\/?.*/, restify.plugins.serveStatic({
  directory: '../app',
  default: 'index.html',
  maxAge:0
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
                        let dirs = listProjects();
                        let resp = {
                          "dirs": dirs,
                          "datKey": datKey,
                          "message": 'Project created: ' + req.params.projectName
                        }
                        res.send(resp);
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

server.post('/form/create', async function (req, res, next) {
  console.log("req.params:" + JSON.stringify(req.params));
  let safeFiletName = sanitize(req.params.file_name);
  let safeTitle = sanitize(req.params.title);
  let projectName = req.params.projectName
  let dir = projectRoot + projectName;
  let exists = await fs.pathExists(dir)
  console.log("pathExists:" + exists)
  if (exists !== true) {
    res.send(new Error('Error: Project does not exist: ' + projectName));
  } else {
    let formsPath = dir + "/content/forms";
    await fs.ensureDir(formsPath)
    let formsJsonPath = dir + "/content/forms.json";
    let packageObj = await fs.readJson(formsJsonPath)
    let metadata = {
      "title": safeTitle,
      "src": "forms/" + safeFiletName + "/form.html"
    }
    packageObj.push(metadata)
    console.log("packageObj con metadata: " + JSON.stringify(packageObj))
    // fs.writeJson(formsJsonPath, packageObj).then(() => {
    await fs.writeJson(formsJsonPath, packageObj)
    let newFormPath = formsPath + "/" +  safeFiletName;
    await fs.ensureDir(newFormPath)
    let srcpath = "../tangerine-forms/forms/editor";
    let formTemplate = await fs.readFile(srcpath + "/form-template.html","utf8")
    console.log("formTemplate: " + formTemplate)
    // let formTemplateStr = JSON.stringify(formTemplate)
    let formTemplateStr = formTemplate.replace("FORMNAME", safeFiletName)
    await fs.outputFile(newFormPath + "/form.html", formTemplateStr)
      let resp = {
      "message": 'Form created: ' + safeFiletName
    }
    res.send(resp);

  }
  return next();
});

server.listen(PORT, function () {
  console.log('server is up!');
  console.log('%s listening at %s', server.name, server.url);
});
