#!/usr/bin/env node

const DB = require(`../db.js`)
const groupsList = require('/tangerine/server/src/groups-list.js')

if (process.argv[2] === '--help') {
    console.log('Usage:')
    console.log('       ./rename-field-value.js')
    process.exit()
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


function fetchNextPage( limit, options) {
  db.allDocs(options, function (err, response) {
    if (response && response.rows.length > 0) {
      options.startkey = response.rows[response.rows.length - 1].id;
      options.skip = 1;
    }
    // handle err or response
  });
}


async function go() {
    const groupNames = await groupsList()
        // let prodDbs = {}
        // let reportingDbs = {}
        var total = 0
    for (let groupName of groupNames) {
        let reportingDbSize;
        let prodDbSize;
        let diffs;
        let duration;
        console.log(`Processing ${groupName}`)
        let docs = [];
        var limit = 1000;
        var skip = 0;
        if (groupName == 'group-1f957b0e-e6c8-428a-a350-bbfc91dafb8c') { //group-d9d21b02-4f96-4def-8ed8-d8d0f8ec7103
            const prodDb = DB(`${groupName}`)
            try {
                const allDocs = await prodDb.allDocs({include_docs: false})
                let params = {limit: limit,include_docs: true, skip: 0}
                for (let i = 0; i <= Math.ceil(allDocs.rows.length/limit); i++) {
                    const theseDocs = await prodDb.allDocs(params)
                        // console.log("check out these docs: " + JSON.stringify(allDocs))
                    let x = 0
                    var isDirty = false
                    for (let doc of theseDocs.rows) {
                        // console.log(" " + JSON.stringify(doc.doc.form) + "/n")
                        if (doc.doc.form && doc.doc.form.id && doc.doc.form.title &&
                            (doc.doc.form.id == 'form-6aef2fba-93f7-41bb-9828-dc76bc894eab') )  {

                            console.log(doc.doc.items[41].title)
                            var inputs = doc.doc.items[4].inputs
                            //          console.log(inputs)    
                                for (var j =0; j<inputs.length;j++) {
                                    if (inputs[j].name == ' Nombre_Director') {
                                        inputs[j].name = 'Nombre_Director'
                                        isDirty=true
                                    }
                                    
                                }
                               
                                  // if (doc.doc.form.id == 'classroom-observation') { doc.doc.form.id = 'RL_Grade1to2ClassroomObservation'; isDirty=true } 
                           
                                   if (isDirty) {
                                        docs.push(doc.doc)
                                        isDirty = false
                                   }     
                                }
                                x++
                            }
                            Object.assign(params.skip += x)
                         
                    if (total <= limit) sleep(5000);
                    console.log('Limit: ' + params.limit)
                    console.log('Skip: ' + params.skip)
                    console.log('X ' + x)
                    console.log('i  ' + i)    
                    prodDb.bulkDocs(docs)
                    console.log('Push docs: ' + docs.length)
                    total += docs.length
                    console.log('TOTAL so far  ' + total)
                    docs = [];	
                }
            } catch (err) {
                console.log("error: " + err)
            }
        } //if groupname
    }
}
go()