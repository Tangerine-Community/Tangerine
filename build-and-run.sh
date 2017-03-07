#!/bin/bash

docker build -t tangerine/tangerine:local .
docker kill tangerine-container
docker rm tangerine-container
./start.sh
docker logs -f tangerine-container
