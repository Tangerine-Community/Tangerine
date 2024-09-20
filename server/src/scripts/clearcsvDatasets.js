// Import required packages
const PouchDB = require('pouchdb');
const moment = require('moment');

// Load the CouchDB endpoint from environment variable
const couchDbEndpoint = process.env.T_COUCHDB_ENDPOINT;  // This should be the full URL up to the CouchDB instance

// Define the database name (Replace 'csv_datasets' with your actual database name)
const databaseName = 'csv_datasets';

// Full URL with the database name
const fullDbUrl = `${couchDbEndpoint}/${databaseName}`;

// Initialize PouchDB with the CouchDB connection
const db = new PouchDB(fullDbUrl);

// Function to delete old documents
async function deleteOldDocs() {
    try {
        // Get the current timestamp in milliseconds
        const oneMonthAgo = moment().subtract(1, 'months').valueOf();

        // Fetch all documents in the database
        const result = await db.allDocs({ include_docs: true });

        // Loop through all documents
        for (const row of result.rows) {
            const doc = row.doc;

            // Check if the document has a dateCreated field and if it's older than one month
            if (doc.dateCreated && doc.dateCreated < oneMonthAgo) {
                // Remove the document
                console.log(`Deleting document: ${doc._id}`);
                await db.remove(doc); // Pass the entire document for deletion
            }
        }

        console.log('Old documents deleted successfully.');
    } catch (error) {
        console.error('Error deleting old documents:', error);
    }
}

// Run the deletion script
deleteOldDocs();
