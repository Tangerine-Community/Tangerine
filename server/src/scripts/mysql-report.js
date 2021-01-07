#!/usr/bin/env node

const mysql = require( 'mysql' )
const fs = require('fs-extra')
const axios = require('axios')

if (process.argv[2] === '--help') {
  console.log('This command reports on the data migration process to mysql for a specific group.')
  console.log('Usage:')
  console.log('       mysql-report <groupId>')
  process.exit()
}

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}


const groupId = process.argv[2] 
const mysqlDatabaseName = groupId.replace(/-/g, '')
const db = new Database({
  host     : 'mysql',
  user     : process.env.T_MYSQL_USER,
  password : process.env.T_MYSQL_PASSWORD,
  database : mysqlDatabaseName 
})
const caseDataDefinitions = [
	{
		name: "Cases",
		mysqlTable: 'case_instances',
		couchdbView: 'cases'
	},
	{
		name: "Case Events",
		mysqlTable: 'caseevent',
		couchdbView: 'caseEvents'
	},
	{
		name: "Event Forms",
		mysqlTable: 'eventform',
		couchdbView: 'eventForms'
	},
	{
		name: "Participants",
		mysqlTable: 'participant',
		couchdbView: 'participants'
	}
]

async function go() {
	console.log('')
	console.log('')
	console.log('___ Case Data ___')
	console.log('')
	console.log('')
	for (const caseDataDefinition of caseDataDefinitions) {
		let mysqlCount = 0
		try {
			const result = await db.query(`select count(*) from ${caseDataDefinition.mysqlTable}`)
			mysqlCount = result[0]['count(*)']
		} catch (e) {
			// Table doesn't exist yet.
		}
		const response = await axios.get(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}/_design/${caseDataDefinition.couchdbView}/_view/${caseDataDefinition.couchdbView}`)
		const couchdbCount = response.data.rows.length
		console.log(`${caseDataDefinition.name}: ${mysqlCount} / ${couchdbCount}`)
	}
	console.log('')
	console.log('')
	console.log('___ Form Data ___')
	console.log('')
	console.log('')
	const forms = await fs.readJSON(`/tangerine/groups/${groupId}/client/forms.json`)
	for (const form of forms) {
		const tableName = form.id.replace(/-/g, '_')
		let mysqlCount = 0
		try {
			const result = await db.query(`select count(*) from ${tableName}`)
			mysqlCount = result[0]['count(*)']
		} catch (e) {
			// Table doesn't exist yet.
		}
		const response = await axios.get(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}/_design/responsesByFormId/_view/responsesByFormId?keys=["${form.id}"]`)
		const couchdbCount = response.data.rows.length
		console.log(`${form.title} (${form.id}): ${mysqlCount} / ${couchdbCount}`)
	}
	console.log('')
	console.log('')
	console.log('*Reporting as (number of records in MySQL) / (number of records in CouchDB)')
	console.log('')
	process.exit()
}
go()
