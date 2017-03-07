#!/bin/bash
find /home/ubuntu/container-data/apks/* -mtime +30 -exec rm {} \;