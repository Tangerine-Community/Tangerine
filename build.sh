#!/bin/bash

TAG=$(git rev-parse --abbrev-ref HEAD);
docker build -t tangerine/tangerine:$TAG .
echo "$TAG"
