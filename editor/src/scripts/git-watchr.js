// usage: first, create a git repo in this dir: git init
// then add all the current files in it:
// git add .
// node ./git-watchr.js /tangerine/client/content/groups/

// Import the watching library
var chokidar = require('chokidar');

// Define our watching parameters
// var path = process.cwd()
var groupPath = process.argv.slice(2) + "";
console.log("groupPath: " + groupPath)
const simpleGit = require('simple-git/promise')(groupPath);

// One-liner for current directory, ignores .dotfiles
chokidar.watch(groupPath, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  console.log(event, path);
  simpleGit.outputHandler((command, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  }).add(path)
  simpleGit.commit("auto-commit for " + path).then(() => console.log('committed ' + path))
    .catch((err) => console.error('failed: ', err));
});