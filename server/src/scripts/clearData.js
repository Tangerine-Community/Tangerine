#!/usr/bin/env node
const PouchDB = require('pouchdb');
const fetch = require('node-fetch');

const couchUrl = process.env.T_COUCHDB_ENDPOINT

async function clearDatabases(groupsToClear) {
	    try {
	      const url = couchUrl + `/_all_dbs`; // Replace with your CouchDB URL
		  
	      // Get all database names
	      const response = await fetch(url);
	      const databaseNames = await response.json();

	      // Filter databases based on groupsToClear
	      const filteredDatabases = databaseNames.filter(dbName => groupsToClear.includes(dbName));

	      
		  for (const dbName of filteredDatabases) {
		        const deleteUrl = `${couchUrl}/${dbName}/_bulk_docs`;
		        const docsToDelete = [];

		        // Get all documents (including design docs)
		        const allDocsUrl = `${couchUrl}/${dbName}/_all_docs?include_docs=true`;
		        const allDocsResponse = await fetch(allDocsUrl);
		        const allDocs = await allDocsResponse.json();

		        // Filter documents (skip design docs)
		        for (const row of allDocs.rows) {
		         if (row.doc && !row.id.startsWith('_design/')) {
		            docsToDelete.push({ _id: row.doc._id, _rev: row.doc._rev, _deleted: true });
		          }
		        }

			console.log (`dbName ${dbName}`)
			console.log (`docsToDelete ${docsToDelete.length}`)
				
		        // Bulk delete if there are documents to delete
		        if (docsToDelete.length > 0) {
		          const deleteResponse = await fetch(deleteUrl, {
		            method: 'POST',
		            headers: { 'Content-Type': 'application/json' },
		            body: JSON.stringify({ docs: docsToDelete }),
		          });

		          if (!deleteResponse.ok) {
		            throw new Error(`Error deleting documents in ${dbName}: ${await deleteResponse.text()}`);
		          }

		          console.log(`Successfully deleted ${docsToDelete.length} documents from group ${dbName}`);
		        } else {
		          console.log(`No documents to delete from group ${dbName}`);
		        }
		     
			  
			 
	       
	      }
	    } catch (error) {
	      console.error(`Error clearing databases:`, error);
	    }
	  }

	  // Example usage
	  const groupsToClear = ["group-bdec473f-df02-4e2a-96a0-67d52c4098d7"];
	  clearDatabases(groupsToClear);