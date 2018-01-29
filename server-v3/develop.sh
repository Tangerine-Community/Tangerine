#!/usr/bin/env bash

source ~/.nvm/nvm.sh
nvm use 8 

cd app 
./node_modules/.bin/ng build --base-href ./ --watch
