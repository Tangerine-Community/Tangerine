#!/usr/bin/env node

/*
 * Downloads documents from a CouchDB server and puts them into json "pack" files.
 * Change group_name to the group your Tangerine will connect to and download from.
 */

var group_name = "ef2";

var fs = require('fs'); // for writeFile
var fse = require('fs-extra'); // for mkdirp
var unirest = require('unirest'); // a REST client
var del = require('del'); // 


// how many documents will be put into a pack at most.
var PACK_DOC_SIZE = 50;

// Path where the json files go.
var PACK_PATH = __dirname + '/../src/js/init';

if ( ! ( process.env.T_ADMIN && process.env.T_PASS ) ) {
  console.log("T_ADMIN and T_PASS env variables need to be set.");
  process.exit(1);
}

// var SOURCE_GROUP = "http://" + process.env.T_ADMIN + ":" + process.env.T_PASS + "@databases.tangerinecentral.org/group-" + group_name;
var SOURCE_GROUP = "http://" + process.env.T_ADMIN + ":" + process.env.T_PASS + "@127.0.0.1:5984/group-" + group_name;
console.log("SOURCE_GROUP" + SOURCE_GROUP);
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


del([ PACK_PATH + '/pack*.json' ]).then( function (paths) {
    if ( paths.length !== 0 ) {
      console.log(
        'Old json packs deleted\n' +
         paths.map(function(el){return "  " + el;}).join('\n')
      );
    } else {
      main();
    }
});


function main() {

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