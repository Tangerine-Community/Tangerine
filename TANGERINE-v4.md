# Tangerine v4 Updates and Changes

 - Two express-app instances. One in 'server' the other in 'server-ui'. The 'server' instance is for API calls that connect to couchdb. The 'server-ui' instance is for serving the UI that use form content files. 
- The form content folder structure in 'server-ui' has changed to only have the '/tangerine/groups/' folders. The '/tangerine/client/<group-id>' folders no longer exist. File paths to the former paths need to be updated to the new paths.