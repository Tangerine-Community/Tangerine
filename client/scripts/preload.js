#!/usr/bin/env node

/*
 * Downloads documents from a CouchDB server and puts them into json "pack" files.
 * Change group_name to the group your Tangerine will connect to and download from.
 * ./preload.js T_ADMIN=username T_PASS=password protocol=https hostname=www.server.org group_name=test123
 */

var group_name = "rti_tanzania_2016_test";

var fs = require('fs'); // for writeFile
var fse = require('fs-extra'); // for mkdirp
var unirest = require('unirest'); // a REST client
var del = require('del'); // 

/*
 * parse arguments...kinda
 * arguments    argv
 * T_ADMIN=username      { T_ADMIN : "username" }
 */
var rawrgv = [];
argv = {};

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  var split = val.split("=");
  var key = split[0];
  var value = split[1];
  argv[key] = value;
});

rawrgv.forEach(function(el, i){
  if (~el.indexOf("--") && ~el.indexOf("=")) {
    var clean = el.substr(2);
    var split = clean.split("=");
    argv[split[0]] = split[1];
  } else if (~el.indexOf("-")) {
    var key = el.replace(/\-/g, "");
    var nextArgIsAnotherKey = ~(rawrgv[i+1] || "").indexOf("-");
    var noMoreKeys = typeof rawrgv[i+1] === "undefined";
    if (nextArgIsAnotherKey || noMoreKeys) {
      argv[key] = true;
    } else {
      argv[key] = rawrgv[i+1];
    }
  }
});

console.log(JSON.stringify(argv));
// override default group with cli argument group
if ( typeof argv.group !== "undefined" ) {
  group_name = argv.group;
}

// how many documents will be put into a pack at most.
var PACK_DOC_SIZE = 50;

// Path where the json files go.
var PACK_PATH = __dirname + '/../src/js/init';

//if ( ! ( process.env.T_ADMIN && process.env.T_PASS ) ) {
if ( ! ( argv.T_ADMIN && argv.T_PASS ) ) {
  console.log("T_ADMIN and T_PASS args need to be set.");
  process.exit(1);
}

var SOURCE_GROUP = argv.protocol + "://" + argv.T_ADMIN + ":" + argv.T_PASS + "@" + argv.hostname+"/group-" + argv.group_name;

console.log("SOURCE_GROUP:" + SOURCE_GROUP);

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

// helper method for json get requests
// needs opts.url.
// Chain handlers to .end(f)
function get(opts) {
  var data = opts.data || {};
  return unirest.get(opts.url)
    .header('Accept', 'application/json')
    .header('Content-Type', 'application/json');
}


// delete any old packs if they're there
del([ PACK_PATH + '/pack*.json' ]).then( function (paths) {

    if ( paths.length !== 0 ) {
      console.log(
        'Old json packs deleted\n' +
         paths.map(function(el){return "  " + el;}).join('\n')
      );
    }

    main();

});

function main() {

  get({url: SOURCE_GROUP}).end(function(res){

    if ( res.code !== 200 ) {
      console.log(res.code)
      console.log(res.rawbody)
      process.exit();
    }

  });


  // Get a list of _ids for the assessments not archived
  post({
      url: SOURCE_GROUP + "/_design/ojai/_view/assessmentsNotArchived"
    })
    .end(function(res) {

      // transform them to dKeys
      var list_query_data = {
        keys: res.body.rows.map(function(row) {
          return row.id.substr(-5);
        })
      };

      // get a list of files associated with those assessments
      post({
          url: SOURCE_GROUP + "/_design/ojai/_view/byDKey",
          data: list_query_data
        })
        .end(function(res) {
          var id_list = res.body.rows.map(function(row) {
            return row.id;
          });
          id_list.push("settings");

          var pack_number = 0;
          var padding = "0000";

          fse.ensureDirSync(PACK_PATH); // make sure the directory is there

          var doOne = function() {

            var ids = id_list.splice(0, PACK_DOC_SIZE); // get X doc ids

            // get n docs
            get({
                url: SOURCE_GROUP + "/_all_docs?include_docs=true&keys=" + JSON.stringify(ids)
              })
              .end(function(res) {

                var file_name = PACK_PATH + "/pack" + (padding + pack_number).substr(-4) + ".json";
                var docs = res.body.rows.map(function(row) {
                  return row.doc;
                });
                var body = JSON.stringify({
                  docs: docs
                });

                fs.writeFile(file_name, body, function(err) {
                  if (err) {
                    return console.log(err);
                  }

                  console.log(file_name + " saved");
                  if (ids.length !== 0) {
                    pack_number++;
                    doOne();
                  } else {
                    console.log("All done");
                  }
                });

              }); // END of get _all_docs

          }; // END of doOne

          doOne();

        }); // END of byDKey callback

    }); // END of assessmentsNotArchived callback

}