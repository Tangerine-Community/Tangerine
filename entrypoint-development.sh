#!/bin/bash

cd /tangerine/server 
npm run start:debug &

if [ "$T_NGROK_AUTH_TOKEN" ]; then
  ./node_modules/.bin/ngrok authtoken "$T_NGROK_AUTH_TOKEN" 
  ./node_modules/.bin/ngrok http -subdomain="$T_NGROK_SUBDOMAIN" 80 &
fi

echo "Building client dev instance"
cd /tangerine/client
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ -c production --output-path ./dev &

function trapperkeeper {
  echo "Exiting - testing if we find the exit in entrypoint-development."
}

trap trapperkeeper EXIT
echo "Running editor dockerdev"
cd /tangerine/editor
npm run dockerdev
