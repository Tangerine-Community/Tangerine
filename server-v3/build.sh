#!/bin/bash

source ~/.nvm/nvm.sh
nvm install 8
nvm use 8

cd app
npm run ng build 

