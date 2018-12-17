#!/bin/bash

set -e

npm install

cd app 
npm install
cd ..

cd wrappers/pwa 
npm install
./node_modules/.bin/bower install --allow-root
cd ../../
