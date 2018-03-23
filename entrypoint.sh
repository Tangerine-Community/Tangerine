#!/usr/bin/env bash

#echo ""
#echo ""
#echo ""
#echo "Setting up database user"
#echo "$T_ADMIN = $T_PASS" >> /etc/couchdb/local.ini
#chown -R couchdb /var/run/couchdb
#couchdb -k
#couchdb &
echo ""
echo ""
echo ""
echo "We will relax while the couch gets ready."
while true; do nc -vz $T_COUCH_HOST 5984 > /dev/null && break; done
echo ""
echo ""
echo ""
echo "CouchDB is ready"
echo ""
echo ""
echo ""
echo "waiting 3 seconds"
sleep 3  # Waits 3 seconds.
echo ""
echo ""
echo ""
echo "Creating user1 at http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1"
curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1" --data-binary '{"_id": "'"org.couchdb.user:$T_USER1"'","name": "'"$T_USER1"'","roles": ["manager"],"type": "user","password": "'"$T_USER1_PASSWORD"'"}'
echo ""
echo ""
echo ""
echo "Push the ojai design doc"
cd /tangerine/editor/app
couchapp push
echo ""
echo ""
echo "Push the dashReporting design doc"
cd /tangerine/editor/result
couchapp push
echo ""
echo ""
echo ""
echo "Insert documents used for new groups."
cd /tangerine/
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" ./documents-for-new-groups/configuration.template | sed "s#INSERT_TREE_URL#"$T_TREE_URL"#g" | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > ./documents-for-new-groups/configuration.json
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" ./documents-for-new-groups/settings.template | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > ./documents-for-new-groups/settings.json
curl -XPUT -d "@./documents-for-new-groups/LocationList.json" -H "Content-Type: application/json" http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/location-list
curl -XPUT -d "@./documents-for-new-groups/acl.json" -H "Content-Type: application/json" http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/acl
curl -XPUT -d "@./documents-for-new-groups/settings.json" -H "Content-Type: application/json" http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/settings
curl -XPUT -d "@./documents-for-new-groups/templates.json" -H "Content-Type: application/json" http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/templates
curl -XPUT -d "@./documents-for-new-groups/configuration.json" -H "Content-Type: application/json" http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/configuration
echo ""
echo ""
echo ""
echo ""
echo "Update globals in group databases."
tangerine deploy-globals --couchUrl "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:5984"
echo ""
echo ""
echo ""
echo ""
echo "Locking down tangerine database in case it is not already secured."
curl -XPOST -d \
  '{ "_id": "_design/_auth",   "language": "javascript",   "validate_doc_update": "function(newDoc, oldDoc, userCtx, secObj) { if (userCtx.roles.indexOf(\"_admin\") === -1) { throw({forbidden: \"Only admins may update this database.\"}); } }" }' \
  -H "Content-Type: application/json" \
  http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine



if [ $PUSH_COUCHAPP_TO_ALL_GROUPS_ON_ENTRYPOINT = true ]
then
echo ""
echo ""
echo ""
echo "Push design doc and default docs to all group databases"
curl http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_all_dbs | jq '.' | grep 'group-' | sed -e 's/\"//g' | sed -e 's/,//' | xargs -I {} couchapp push http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/{}
echo ""
echo ""
echo ""
fi

echo "Push the server couchapp"
cd /tangerine/server/couchapp
couchapp push
echo ""
echo ""
echo ""
echo "Go nginx!"
sed -i -e "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" /etc/nginx/sites-available/tangerine.conf
# These settings are from the Alpine aports version of nginx's initd comand: https://git.alpinelinux.org/cgit/aports/tree/main/nginx/nginx.initd?h=3.6-stable
cfgfile=${cfgfile:-/etc/nginx/nginx.conf}
pidfile=/run/nginx/nginx.pid
command=/usr/sbin/nginx
command_args="-c $cfgfile"
#checkpath --directory --owner nginx:nginx ${pidfile%/*}
# First check if the config file is correct - if there are no messages, all is good.
$command $command_args -t -q
# Now launch nginx
$command $command_args
echo ""
echo ""
echo ""

# Send nginx logs to docker logs.
tail -f /var/log/nginx/access.log &
tail -f /var/log/nginx/error.log &

echo ""
echo ""
echo ""

if [ "$T_RUN_MODE" = "production" ]
then
	echo "Start the pm2 process"
	cd /tangerine
	pm2 start --no-daemon ecosystem.json
fi

if [ "$T_RUN_MODE" = "development" ]
then
	echo "Start the pm2 process"
	cd /tangerine
	pm2 start --no-daemon ecosystem.json &
	echo ""
	echo ""
	echo "Stoppping server so we can use nodemon instead"
	pm2 stop server
	echo ""
	echo ""
	echo "Starting nodemon for server; watching for changes..."
	npm run watch
	echo ""
	echo ""
	echo "Monitoring for editor changes..."
	cd /tangerine/editor && npm run debug &
	echo ""
	echo ""
	echo ""
	echo "Monitoring for client changes..."
	cd /tangerine/client && npm run debug
fi
