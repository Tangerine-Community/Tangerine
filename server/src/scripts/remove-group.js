#!/usr/bin/env node
const Nano = require('nano');
var Base64 = require('base-64');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const url = process.env.T_COUCHDB_ENDPOINT;

const opts = {
	url: url,
	parseUrl: false,
	requestDefaults: {
		// timeout: 10000,
		headers: {
			'User-Agent': 'couchmigrate',
			'x-cloudant-io-priority': 'low'
		}
	}
}


const nano = Nano(opts);
const nanoGroups = Nano(opts);

const currentDate = new Date();
const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
var sum = 0

let groupsToRemove = [
	'group-770e11c3-8c49-4894-b16e-2a6291c74cfe',
	'group-268d69ff-85af-40a9-a99d-83697931bc3d'
]

//for (var g=0; g < groupsToRemove.length; g++) {
	
	
	var timeout = 0;

	let paidGroups = [];
	let reportingGroups = [];

	let dataPath = '/tangerine/'
	let paidFilePath = '/paid-worker-state.json'
	let reportingFilePath = '/reporting-worker-state.json'


	const readAndParseFile = (filename, array) => {
		if (fs.existsSync(filename)) {
			const fileContent = fs.readFileSync(filename, 'utf8');
			array = JSON.parse(fileContent);
		}
		return array;
	};

	function saveJSONToFile(filePath, jsonData) {
		const modifiedData = JSON.stringify(jsonData);
		fs.writeFile(filePath, modifiedData, 'utf8', err => {
		  if (err) {
			console.log('Error saving JSON data:', err);
			return;
		  }
		  console.log('JSON data saved successfully.');
		});
	  }

	//ticketCreatedRemove30 = readAndParseFile(filenameRemove30, ticketCreatedRemove30);


	function wait(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	//remnove db with provided name
	async function removeDatabase(dbName) {
		try {
			const response = await nano.db.destroy(dbName);
			console.log('Database removed:', dbName);
		} catch (err) {
			console.log('Error removing database:', err.reason);
		}
	}

	//hit the view and check 
	
	const processDbName = async (dbName) => {
		//const db = nano.db.use(dbName);
		
		if (groupsToRemove.includes(dbName)) {
 
			console.log('Group in list to be removed: ', dbName);
	//sum += body.rows?.length;
	let reqName = '';


		  // Execute reporting-worker-pause command
		  await new Promise((resolve) => {
			exec('reporting-worker-pause', (error, stdout, stderr) => {
			  if (error) {
				console.error(`Error executing reporting-worker-pause: ${error.message}`);
			  } else if (stderr) {
				console.error(`reporting-worker-pause command encountered an error: ${stderr}`);
			  } else {
				console.log('2. reporting-worker-pause command executed successfully.');
			  }
			  resolve();
			});
		  });

		 // Wait for reporting-worker-running file to be removed
		 let runningFilePath = 'reporting-worker-pause';
		 let filePresent = fs.existsSync(runningFilePath);
	 
		 while (filePresent) {
		   console.log('reporting-worker-running file is present.');
		   await wait(5000);
		   filePresent = fs.existsSync(runningFilePath);
		 }
	 
		 console.log('3. reporting-worker-running file is present. Continue with the execution...');
	 
		 let reportingGroups = readAndParseFile(reportingFilePath);
		 let paidGroups = readAndParseFile(paidFilePath);
	 
		 // Remove the found group from reporting worker JSON
		 const foundGroupIndex = reportingGroups.databases.findIndex((group) => group.name == dbName);
		 if (foundGroupIndex !== -1) {
		   console.log(`4. Removing ${dbName} from reporting-worker-state.json`);
		   reportingGroups.databases.splice(foundGroupIndex, 1);
		 }
	 

		 // Save the modified data back to the file
		 saveJSONToFile(reportingFilePath, reportingGroups);
	 
		 await wait(5000); 

		 // Remove the found group from paid worker JSON
		 const foundPaidGroupIndex = paidGroups.groups.findIndex((group) => group.name == dbName);
		 if (foundPaidGroupIndex !== -1) {
		   console.log(`5. Removing ${dbName} from paid-worker-state.json`);
		   paidGroups.groups.splice(foundPaidGroupIndex, 1);
		 }
	 
		 // Save the modified data back to the file
		 
		 saveJSONToFile(paidFilePath, paidGroups);
		 
		 // Execute reporting-worker-unpause command
		 await new Promise((resolve) => {
		   exec('reporting-worker-unpause', (error, stdout, stderr) => {
			 if (error) {
			   console.error(`Error executing reporting-worker-unpause: ${error.message}`);
			 } else if (stderr) {
			   console.error(`reporting-worker-unpause command encountered an error: ${stderr}`);
			 } else {
			   console.log('6. reporting-worker-unpause command executed successfully.');
			 }
			 resolve();
		   });
		 });
	 
		 // Wait for reporting-worker-running file to be present
		 runningFilePath = 'reporting-worker-pause';
		 filePresent = fs.existsSync(runningFilePath);
	 
		 while (filePresent) {
		   console.log('reporting-worker-pause file is present. Waiting for it to be removed...');
		   await wait(5000);
		   filePresent = fs.existsSync(runningFilePath);
		 }
	 
		 console.log('7. reporting-worker-pause file is not present. Continue with the execution...');
	 
		 // Remove the corresponding folder
		 const folderPath = path.join(dataPath,'/groups', dbName);
		 try {
			fs.rmdirSync(folderPath, { recursive: true });
			console.log(`8. Folder ${dbName} removed successfully.`);
		} catch (err) {
			console.log(`Error removing folder ${dbName}:`, err.reason);
		  }


		 // Remove the corresponding symlink
		 const linkPath = path.join(dataPath,'/client/content/groups', dbName);
		 try {
			fs.unlinkSync(linkPath, { recursive: true });
			console.log(`9. Link ${dbName} removed successfully.`);
		} catch (err) {
			console.log(`Error removing symlink ${dbName}:`, err.reason);
		  }


		 ////remove group from groups db
		 nanoGroups.use('groups').get(dbName, async (err, doc) => {
			if (err) {
			  console.log(err.reason);
			  return;
			}
		  
			nanoGroups.use('groups').destroy(dbName, doc._rev, async (err, body) => {
			  if (err) {
				console.log(err.reason);
				return;
			  }
		  
			  console.log(`10. Document ${dbName} has been removed successfully.`);
			});
		  });
		
		 // Remove all groups for this dbName
		 console.log(`11. Removing all ${dbName}*.`);
		 await removeDatabase(dbName);
		 await removeDatabase(dbName + '-conflict-revs');
		 await removeDatabase(dbName + '-devices');
		 await removeDatabase(dbName + '-log');
		 await removeDatabase(dbName + '-reporting');
		 await removeDatabase(dbName + '-reporting-sanitized');
	   }
	 };

for (let i = 0; i < groupsToRemove.length; i++) {
	
	const dbName = groupsToRemove[i];
	setTimeout(processDbName, timeout, dbName);
	timeout += 5000;

}





///};