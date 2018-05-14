#!/bin/bash

cd /tangerine/server 
nodemon --legacy-watch index.js &
sleep 3
cd /tangerine/client 
./develop.sh & 
sleep 3
cd /tangerine/editor
npm run dockerdev
rm /tangerine/editor/dist/sw.js
