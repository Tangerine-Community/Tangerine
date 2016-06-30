#!/usr/bin/env bash

service nginx start
cd /root/Tangerine-tree
pm2 start --no-daemon ecosystem.json
