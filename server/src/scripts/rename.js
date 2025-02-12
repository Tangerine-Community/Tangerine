#!/usr/bin/env node

const DB = require(`/tangerine/server/src/db.js`)
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
        if (groupName == 'group-a4a79c1b-3270-45d4-a4d8-8b0d2e1ee3f7') { //group-d9d21b02-4f96-4def-8ed8-d8d0f8ec7103
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
                        if (doc.doc.form && doc.doc.form.id &&
                            (doc.doc.form.id == 'user-profile'
						) )  {

                            
						 for  (let item of doc.doc.items)  {   
							 
                            var inputs = item.inputs
                            //          console.log(inputs)    
                                for (var j =0; j<inputs.length;j++) {
									if (inputs[j].name == 'loc' &&   inputs[j]?.value != 'undefined' && inputs[j]?.value.length == 4 && inputs[j]?.value[3].value == '91210020406') {
									  console.log(inputs[j].value[3].value)
									  inputs[j].value[3].value = '91210020403'
									  console.log(inputs[j].value[3].value)
									  isDirty = true;
									}
									
									
									
                                }
							}
                               
                                 
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
               //     prodDb.bulkDocs(docs)
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
