#!/usr/bin/env bash

echo ""
echo ""
echo ""
echo "Setting up database user"
echo "$T_ADMIN = $T_PASS" >> /etc/couchdb/local.ini
sudo chown -R couchdb /var/run/couchdb
couchdb -k
couchdb -b
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
echo "Creating user1 at http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1"
curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1" --data-binary '{"_id": "'"org.couchdb.user:$T_USER1"'","name": "'"$T_USER1"'","roles": [],"type": "user","password": "'"$T_USER1_PASSWORD"'"}'
echo ""
echo ""
echo ""
echo "Push the ojai design doc"
cd /tangerine-server/editor/app
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/configuration.template | sed "s#INSERT_TREE_URL#"$T_TREE_URL"#g" | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/configuration.json
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/settings.template | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/settings.json 
couchapp push
echo ""
echo ""
echo ""
echo "Push the robbert couchapp"
cd /tangerine-server/robbert/couchapp
couchapp push
echo ""
echo ""
echo ""
echo "Go nginx!"
sed -i -e "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" /etc/nginx/sites-available/tangerine.conf 
service nginx start
service nginx reload
echo ""
echo ""
echo ""

if [ "$T_RUN_MODE" = "production" ]
then
	echo "Start the pm2 process"
	cd /tangerine-server
	pm2 start --no-daemon ecosystem.json
fi

if [ "$T_RUN_MODE" = "development" ]
then
	echo "Start the pm2 process"
	cd /tangerine-server
	pm2 start --no-daemon ecosystem.json &
	echo ""
	echo ""
	echo ""
	echo "Monitoring for editor chages..."
	cd /tangerine-server/editor && npm run debug &
	echo ""
	echo ""
	echo ""
	echo "Monitoring for client chages..."
	cd /tangerine-server/client && npm run debug
fi
