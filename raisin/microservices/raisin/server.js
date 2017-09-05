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

let listProjects = function () {
    var dir = projectRoot;
    // const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory())
    const isDirectory = source => fs.lstatSync(source).isDirectory()
    const getDirectories = source =>
        fs.readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    let dirList = getDirectories(dir);
    let dirs = [];
    for (var value of dirList) {
        console.log('value: ' + value);
        var dir = value.replace(projectRoot, '')
        dirs.push(dir)
    }
    return dirs;
};
server.get('/project/listAll', function (req, res, next) {
    let dirs = listProjects();
    res.send(dirs);
  return next();
});

// file: 'build/default/index.html'

server.get(/\/projects\/?.*/, restify.plugins.serveStatic({
    directory: '../projects',
    default: 'index.html'
}));

server.post('/project/create', async function (req, res, next) {
    console.log("req.params:" + JSON.stringify(req.params));
    var safeProjectName = sanitize(req.params.projectName);
    const dir = projectRoot + safeProjectName;
    fs.pathExists(dir)
        .then((exists) => {
            console.log("pathExists:" + exists)
            if (exists == true) {
                res.send(new Error('Error: Project already exists: ' + req.params.projectName));
            } else {
                fs.ensureDir(dir).then(() => {
                    let contentPath = dir + "/content";
                    fs.ensureDir(contentPath).then(() => {
                        let srcpath = "../tangy";
                        let dstpath = dir + "/client";
                        fs.ensureSymlink(srcpath, dstpath).then(() => {
                            mirrorOpts = {
                                dereference: false,
                                watch: true,
                                ignoreDirs: false
                            };
                            Dat(dir, mirrorOpts, function (err, dat) {
                                var importer = dat.importFiles(dir, mirrorOpts)
                                dat.joinNetwork();
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
                            });
                        })
                    })
                })
            }
        })
    return next();
});

server.listen(PORT, function () {
  console.log('server is up!');
  console.log('%s listening at %s', server.name, server.url);
});