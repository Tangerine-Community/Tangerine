#!/usr/bin/env bash
#sudo mkdir /var/run/couchdb
sudo chown -R couchdb /var/run/couchdb
echo "Setting up new admin for this TSI - T_ADMIN = $T_ADMIN T_NEW_ADMIN = $T_NEW_ADMIN TS_URL = $TS_URL"
sudo -E sh -c 'echo "$T_NEW_ADMIN = $T_NEW_ADMIN_PASS" >> /etc/couchdb/local.ini'
couchdb -k
couchdb -b
service nginx start
echo "TS_URL = $TS_URL"
echo "Sending http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1"
curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1" --data-binary '{"_id": "'"org.couchdb.user:$T_USER1"'","name": "'"$T_USER1"'","roles": [],"type": "user","password": "'"$T_USER1_PASSWORD"'"}'
cd /root/Tangerine-server/editor/app
sed "s/\INSERT_HOSTNAME/"$TS_URL"/g" _docs/configuration.template > _docs/configuration.json
couchapp push
#updated=$(curl -s http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/settings | sed -En "s/local.tangerinecentral.org/$TS_URL/p")
#curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/settings" --data-binary $updated
cd /root/Tangerine-server
pm2 start --no-daemon ecosystem.json
