
set -v

cd /tangerine-server/editor

couchdb -k
couchdb -b

npm start init

cd /tangerine-server/client
npm run gulp init
