#!/usr/bin/env bash

cd app 
./node_modules/.bin/ng build --base-href ./ --watch --output-path ../builds/dev/app &
cd ..

cd builds/dev
../../node_modules/.bin/http-server -p 4200 -c-1
