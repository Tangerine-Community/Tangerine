#!/usr/bin/env bash
sudo mkdir /var/run/couchdb
sudo chown -R couchdb /var/run/couchdb
couchdb -k
couchdb -b
service nginx start
#ENV T_HOSTNAME local.tangerinecentral.org
#ENV T_ADMIN admin
#ENV T_PASS password
# $T_USER1, $T_USER1_PASSWORD, $TS_URL
echo "Setting up configuration for this TSI"
sudo -E sh -c 'echo "$T_ADMIN = $T_PASS" >> /etc/couchdb/local.ini'
couchdb -k
couchdb -b
curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:$T_USER1" --data-binary '{"_id": "'"org.couchdb.user:$T_USER1"'","name": "'"$T_USER1"'","roles": [],"type": "user","password": "'"$T_USER1_PASSWORD"'"}'
cd /root/Tangerine-server/editor/app
sed "s/\INSERT_HOSTNAME/"$TS_URL"/g" _docs/configuration.template > _docs/configuration.json
couchapp push
updated=$(curl -s http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/settings | sed -En "s/local.tangerinecentral.org/$TS_URL/p")
curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/tangerine/settings" --data-binary $updated
cd /root/Tangerine-server
pm2 start --no-daemon ecosystem.json
