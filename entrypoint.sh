#!/usr/bin/env bash
sudo mkdir /var/run/couchdb
sudo chown -R couchdb /var/run/couchdb
couchdb -k
couchdb -b
service nginx start
cd /root/Tangerine-server
pm2 start --no-daemon ecosystem.json
