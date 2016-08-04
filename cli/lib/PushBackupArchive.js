"use strict";

var unirest = require('unirest')
var walk = require('walkdir')
var fs = require('fs-extra')
var slog = require('single-line-log').stdout;

// Globar vars for capturing reporting info.
var report = {
  newDocIds: 0,
  duplicateDocIds: 0,
  updatedDocIds: 0,
  fileList: [],
  failedFiles: [],
  log: []
}

module.exports = function(options, callback) {

  // helper method for json post requests
  // needs opts.data and opts.url.
  // Chain handlers to .end(f)
  function post(opts) {
    var data = opts.data || {};
    return unirest.post(opts.url)
      .header('Accept', 'application/json')
      .header('Content-Type', 'application/json')
      .send(data);
  }
  // helper method for json put requests
  // needs opts.data and opts.url.
  // Chain handlers to .end(f)
  function put(opts) {
    var data = opts.data || {};
    return unirest.put(opts.url)
      .header('Accept', 'application/json')
      .header('Content-Type', 'application/json')
      .send(data);
  }



  // Begin with getting the list of files given `options.path`.
  var getFileList = function(path) {
    var files = []
    var emitter = walk(path)
    emitter.on('file',function(filename,stat){
      files.push(filename)
    })
    emitter.on('end', function() {
      parseFiles(files)
    })
  }
  getFileList(options.path)

  var parseFiles = function(files) {
    var docs = []
    for (let file of files) {
      console.log("file: " + file)
      var filename = file.replace(/^.*[\\\/]/, '')
      try {
        var items = fs.readJsonSync(file)
        if (items.hasOwnProperty('rows')) {
          console.log('Found ' + items.rows.length + ' docs in ' + file)
          for (let item of items.rows) {
            docs.push(item.doc)
          }
        }
        else {
          console.log(file + ' does not have a rows property, trying Plan B.');
          console.log("Items in this file: "  + Object.keys(items).length);
          var key;
          for (key in items) {
            if (items.hasOwnProperty(key)) {
              // console.log("key: " + items[key])
            }

            if (items[key].hasOwnProperty("_id")) {
              var _id = items[key]["_id"];
              var assessmentId = items[key]["assessmentId"];
              report.fileList.push("file:" + filename + " _id: " + _id + " assessmentId: " + assessmentId)
              docs.push(items[key])
            }
          }

          //throw(file + ' does not have a rows property')
        }
      }
      catch(err) {
        report.failedFiles.push({
          fileName: file,
          message: err
        })
      }
    }
    postDocs(docs)
  }

  var postDocs = function(docs) {
    // Run a recursive postDoc function until all docs are pushed.
    var i = 0
    var postDoc = function() {
      post({
        url: options.url,
        data: docs[i]
      })
      .end(function(res) {
        if (typeof res.body !== 'undefined') {
          if (res.body.error !== 'conflict'){
            report.newDocIds++
            // slog(`Posted ${i} of ${docs.length}`)
            slog(`Posted newDoc _id:  ${res.body.id} ; doc ${i+1} of ${docs.length}`)
            report.log.push(`Posted newDoc _id:  ${res.body.id} ; doc ${i+1} of ${docs.length}`)
            i++
            if (!docs[i]) {
              callback(null, report)
            }
            else {
              postDoc()
            }
          } else {
            var _id = docs[i]._id
            var _rev = docs[i]._rev
            var url = options.url + "/" + _id;
            report.log.push("duplicate ID. Trying to PUT it. url: "  + url + " _rev: " + _rev)
            put({
              url: url,
              data: docs[i]
            })
              .end(function(res) {
                if (typeof res.body !== 'undefined') {
                  if (res.body.error !== 'conflict'){
                    report.log.push("Updated _id: "  + _id + " _rev: " + _rev + "; Output: " + JSON.stringify(res.body))
                    report.updatedDocIds++
                    slog(`Processed via Put (Updated); doc ${i+1} of ${docs.length}`)
                    report.log.push(`Processed via Put (Updated); doc ${i+1} of ${docs.length}`)
                  } else {
                    report.log.push("Could not update _id: "  + _id + " _rev: " + _rev + "; Output: " + JSON.stringify(res.body))
                    report.duplicateDocIds++
                    slog(`Processed via Put (No Update:Conflict); doc ${i+1} of ${docs.length}`)
                    report.log.push(`Processed via Put (No Update:Conflict); doc ${i+1} of ${docs.length}`)
                  }
                }
                i++
                if (!docs[i]) {
                  callback(null, report)
                }
                else {
                  postDoc()
                }
              })
          }
        } else {
          console.log("Error - res.body is empty. ")
        }
      })
    }
    postDoc()
  }

}
