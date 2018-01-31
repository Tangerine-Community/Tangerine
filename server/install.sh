#!/bin/bash

source ~/.nvm/nvm.sh
nvm install 8
nvm use 8

echo foo
npm install

cd app
npm install

