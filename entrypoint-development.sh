#!/bin/bash

cd /tangerine/server 
npm run start:debug &

if [ "$T_NGROK_AUTH_TOKEN" ]; then
  ./node_modules/.bin/ngrok authtoken "$T_NGROK_AUTH_TOKEN" 
  ./node_modules/.bin/ngrok http -subdomain="$T_NGROK_SUBDOMAIN" 80 &
fi


cd /tangerine/client
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev &

cd /tangerine/editor
npm run dockerdev
