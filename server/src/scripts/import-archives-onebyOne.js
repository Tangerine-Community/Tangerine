#!/usr/bin/env node

if (!process.argv[2]) {
	console.log('Place archives from clients into the ./data/archives folder on the host machine then run...')
	console.log('       ./bin.js <groupName>')
	console.log('Example: ./bin.js myGroup')
	process.exit()
}

const util = require('util')
const readdir = util.promisify(require('fs').readdir)
const readFile = util.promisify(require('fs').readFile)
const pako = require('pako')
const axios = require('axios')
let url = 'https://merla-et.rti.org/db/group-124d5c46-2c7c-4d63-baea-a448cda94e9a/'
const ARCHIVES_PATH = '/archives'

async function go() {
	const archivesList = await readdir(ARCHIVES_PATH)
	for (const archivePath of archivesList) {
		const archiveContents = await readFile(`${ARCHIVES_PATH}/${archivePath}`, 'utf-8')
		const lines = archiveContents.split('\n')

		let docsArray = [];
		let dbName = ''
		lines.forEach(line => {
			if (line.startsWith('{"version":')) {
				try {
					const parsedLine = JSON.parse(line);
					if (parsedLine.db_info) {
						dbName = parsedLine.db_info.db_name;
					}
				} catch (e) {
					console.log(`Failed to parse line db_name ${archivePath}:`, e);
				}
			}

			if (line.startsWith('{"docs":')) {
				try {
					const parsedLine = JSON.parse(line);
					if (parsedLine.docs) {
						docsArray = docsArray.concat(parsedLine.docs);
					}
				} catch (e) {
					console.log(`Failed to parse line in ${archivePath}:`, e);
				}
			}
		});

		if (docsArray.length === 0) {
			console.log(`No docs array found in ${archivePath}`);
			continue;
		}

		const userProfileDoc = docsArray.find(item => item.form && item.form.id === 'user-profile')
		if (!userProfileDoc) {
			console.log(`No user-profile document found in ${archivePath}`);
			continue;
		}
		console.log(`userProfileDoc:${dbName} ${userProfileDoc._id}`)

		console.log(`docsArray ${docsArray.length}`);
		const docs = docsArray
			.map(item => {
				if (item.collection !== 'TangyFormResponse') return;
				if (item.form && item.form.id !== 'user-profile') {
					// Check for existing "userProfileId" input
					const existingUserProfileIdInput = item.items[0].inputs.find(
						(input) => input.name === 'userProfileId'
					);

					if (!existingUserProfileIdInput) {
						// Create "userProfileId" input if it doesn't exist
						item.items[0].inputs.push({
							name: 'userProfileId',
							value: userProfileDoc._id
						});
					} else {
						// Update the value of existing "userProfileId" input
						existingUserProfileIdInput.value = userProfileDoc._id;
					}

					// Check for existing "tabletUserName" input (similar logic)
					const existingTabletUserNameInput = item.items[0].inputs.find(
						(input) => input.name === 'tabletUserName'
					);

					if (!existingTabletUserNameInput) {
						// Create "tabletUserName" input if it doesn't exist
						item.items[0].inputs.push({
							name: 'tabletUserName',
							value: dbName
						});
					} else {
						// Update the value of existing "tabletUserName" input
						existingTabletUserNameInput.value = dbName;
					}
				}

				return item;
			})
			.filter(doc => doc !== undefined)
		const sleep = (seconds) => {
			const end = Date.now() + seconds * 1000;
			while (Date.now() < end) {}
		};


		 
		console.log(`docs ${docs.length}`);
		for (const doc of docs) {
			const docUrl = `${url}${doc._id}`
			
			try {
			                

			                // Get the document to fetch the latest revision
				let getResponse;
                try {
                    getResponse = await axios({
                        method: 'get',
                        url: docUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic dGFuZ2VyaW5lOnI2RXlhbXY0UnNQdmJVaFJSTGtMQzRHeHYzSkRWN3lL'
                        }
                    });
					if (getResponse.data.doc)
						console.log(`found`);
					else continue;
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.log(`Document ${doc._id} not found, will create new.`);
                        //continue;
                    } else {
                        throw error;
                    }
                }

				const currentDoc = getResponse.data.doc;
				currentDoc._rev =  getResponse.data._rev;
				console.log(` ${doc._id} ${doc._rev} .`);
				
			                let body = JSON.stringify({
			                    "new_edits": false,
			                    doc
			                });

			                await axios({
			                    method: 'put',
			                    url: docUrl,
			                    data: body,
			                    headers: {
			                        'Content-Type': 'application/json',
			                        'Authorization': 'Basic dGFuZ2VyaW5lOnI2RXlhbXY0UnNQdmJVaFJSTGtMQzRHeHYzSkRWN3lL'
			                    }
			                });
							sleep(1);

			                
			            } catch (error) {
			                if (error.response && error.response.status === 409) {
			                    console.log(`CONFLICT,  ${doc._id}`);
			                } else if (error.response && error.response.status === 431) {
			                    console.log(`TOO LARGE, ${doc._id}`);
			                } else {
			                    console.log('ERROR', error.message);
								sleep(70);
			                }
			            }
			        }
			    }
			}

			try {
			    go();
			} catch (e) {
			    console.log(e);
			}