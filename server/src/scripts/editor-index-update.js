 #!/usr/bin/env node

 const groupsList = require('/tangerine/server/src/groups-list.js')
 const util = require('util');
 const exec = util.promisify(require('child_process').exec)

 if (process.argv[2] === '--help') {
   console.log('Usage:')
   console.log('       translations-update')
   process.exit()
 }

 async function go() {
   const groupNames = await groupsList()
   for (let groupName of groupNames) {
 	  try {
 	   await exec(`cp /tangerine/content-sets/default/editor/index.html /tangerine/groups/${groupName}/editor/index.html`) 
 	  } catch (error) {
 		    console.error('Missing group: '+groupName + ' '+ error);
 		  }
   }
 }
 go()