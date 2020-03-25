#!/bin/bash
echo "Running updates for v2.2.0"
echo ""
echo ""
echo ""
echo "Push design doc to all group databases"
cd /tangerine-server/editor/app
curl http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASSWORD@$T_COUCH_HOST:$T_COUCH_PORT/_all_dbs | jq '.' | grep 'group-' | sed -e 's/\"//g' | sed -e 's/,//' | xargs -I {} couchapp push http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASSWORD@$T_COUCH_HOST:$T_COUCH_PORT/{}
echo "Push design doc to all tangerine database"
curl http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASSWORD@$T_COUCH_HOST:$T_COUCH_PORT/_all_dbs | jq '.' | grep 'tangerine' | sed -e 's/\"//g' | sed -e 's/,//' | xargs -I {} couchapp push http://$T_COUCHDB_USER_ADMIN_NAME:$T_COUCHDB_USER_ADMIN_PASSWORD@$T_COUCH_HOST:$T_COUCH_PORT/{}
echo ""
