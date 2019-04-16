#!/bin/bash
echo "Running updates for 1.0.0"
echo ""
echo ""
echo ""
echo "Push design doc to all group databases"
cd /tangerine-server/editor/app
curl http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_all_dbs | jq '.' | grep 'group-' | sed -e 's/\"//g' | sed -e 's/,//' | xargs -I {} couchapp push http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/{}
echo ""
echo "Push location-list doc to all groups that don't have it."
echo ""
echo "You have upgraded to 1.0.0"

curl http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_all_dbs | jq '.' | grep 'group-' | sed -e 's/\"//g' | sed -e 's/,//' | while read database 
do
  curl -X POST -H 'Content-Type: application/json' -d @/tangerine-server/documents-for-new-groups/LocationList.json http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/$database
done

