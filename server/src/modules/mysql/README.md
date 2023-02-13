# DEPRECATED Mysql Module

## This module is deprecated as of v3.26.2 and will be removed in v3.28.0.

Python code to convert Tangerine (CouchDB database) documents to MySQL database.  Each document type maps to one database table.
CreateTable.sql script needs to be run in each MySQL database so that the 4 basic tables are created.  Tangerine response form table willbe created on the fly.
The python code updates the database tables (schema and data) on the fly.
Delete is curently not supported.
It pulls on CouchDB changes on a set time intervals and process the changes only after the initial synchronization.

TangerineToMySQL.py: it uses the setting.ini for One tangerine couchDB database to one MySQL database conversion
MultipleTangerineToMySQL.py: it uses setting2.ini that converts multiple couchDB databases to multiple MySQL database, it doesn't fully work yet, still more to do.
