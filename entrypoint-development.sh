#!/bin/bash

cd /tangerine/server 
nodemon --inspect=0.0.0.0:9229 --legacy-watch index.js &
sleep 3
cd /tangerine/client 
./develop.sh & 
sleep 3
cd /tangerine/editor
npm run dockerdev
