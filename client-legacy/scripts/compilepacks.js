#!/usr/bin/env node

var fs = require('fs')
var junk = require('junk');
var packsFolder = __dirname + '/../test/packs'
fs.readdir(packsFolder, function(err, files) {
  if (err) return;
  var data = []
  files.filter(junk.not).forEach(function(f) {
    console.log("file: " + f)
    var pack = JSON.parse(fs.readFileSync(packsFolder + '/' + f, 'utf8'))
    data = data.concat(pack)
  });
  fs.writeFile(__dirname + '/../test/packs.json', JSON.stringify(data, null, 2), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
});
