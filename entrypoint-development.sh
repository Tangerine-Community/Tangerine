#!/bin/bash
echo "entrypoint-development.sh - starting server"
cd /tangerine/server 
npm run start:debug &

if [ "$T_NGROK_AUTH_TOKEN" ]; then
  ./node_modules/.bin/ngrok authtoken "$T_NGROK_AUTH_TOKEN" 
  ./node_modules/.bin/ngrok http -subdomain="$T_NGROK_SUBDOMAIN" 80 &
fi

echo "entrypoint-development.sh - starting client"
cd /tangerine/client
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ -c production --output-path ./dev &

#function trapperkeeper {
#  echo "Exiting - testing if we find the exit in entrypoint-development."
#}
#
#trap trapperkeeper EXIT

echo "entrypoint-development.sh - starting editor"
cd /tangerine/editor
npm run dockerdev
