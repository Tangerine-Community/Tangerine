sudo mkdir /var/run/couchdb
sudo chown -R couchdb /var/run/couchdb
couchdb -k
couchdb -b
cd /root/Tangerine-server
pm2 start --no-daemon ecosystem.json
