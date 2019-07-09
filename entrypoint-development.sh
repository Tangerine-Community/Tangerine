#!/bin/bash

cd /tangerine/server 
npm run start:debug &

cd /tangerine/client
./node_modules/.bin/ng build --watch --poll 100 --base-href ./ --output-path ./dev &

cd /tangerine/editor
npm run dockerdev
