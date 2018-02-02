#!/bin/bash

npm install

cd tangy-forms
yarn install --frozen-lockfile --production=false
./node_modules/.bin/bower install --allow-root
cd ..

cd shell
npm install
cd ..

cd wrappers/pwa 
npm install
./node_modules/.bin/bower install --allow-root
cd ../../
