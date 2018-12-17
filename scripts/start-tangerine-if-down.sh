#!/bin/bash

if docker ps | grep 'tangerine'
  then echo "$(date) Tangerine is up"
  else echo "$(date) Tangerine was down!" && w && free -h && echo  "Starting..." && docker start tangerine
fi
