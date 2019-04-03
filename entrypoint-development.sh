#!/bin/bash

cd /tangerine/server 
npm run start:dev &

cd /tangerine/editor
npm run dockerdev
