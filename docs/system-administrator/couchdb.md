# CouchDB

## Upgrade
If there has been a security update to CouchDB 2.x, all you must do is rerun the start.sh command and the new image for CouchDB will be downloaded and run.

## Change password

```bash
# Shutdown tangerine and couchdb
docker stop tangerine couchdb
# Remove the docker files that cached the password for CouchDB.
rm -r data/couchdb/local.d
# Update the T_COUCHDB_USER_ADMIN_PASS variable.
vim config.sh
# update the cached password in the reporting worker configuration.
vim data/reporting-worker-state.json
# If using the mysql module, update the passwords in each group's mysql state file.
vim data/mysql/state/<groupId>.ini
# start.sh will rebuild the couchdb and tangerine containers which will update the password in all necessary places.
./start.sh <version>
```
