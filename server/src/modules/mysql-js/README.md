Javascript code to convert Tangerine (CouchDB database) documents to MySQL database.  Each document type maps to one database table.

CreateTable.sql script needs to be run in each MySQL database so that the 4 basic tables are created.  Tangerine response form table will be created on the fly.
The js code updates the database tables (schema and data) on the fly.
Delete is currently not supported.
It pulls on CouchDB changes on a set time intervals and process the changes only after the initial synchronization.
