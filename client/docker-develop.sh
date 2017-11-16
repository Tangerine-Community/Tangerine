#!/usr/bin/env bash

docker kill tangerine-client
docker rm tangerine-client
docker run -d \
  --name tangerine-client \
  --volume $(pwd)/tangy-forms/index.html:/tangerine/tangy-forms/index.html \
  --volume $(pwd)/tangy-forms/global-styles.html:/tangerine/tangy-forms/global-styles.html \
  --volume $(pwd)/tangy-forms/fonts:/tangerine/tangy-forms/fonts \
  --volume $(pwd)/tangy-forms/src:/tangerine/tangy-forms/src \
  --volume $(pwd)/shell/src:/tangerine/shell/src \
  --volume $(pwd)/content:/tangerine/content \
  -p 4200:4200 tangerine/tangerine-client:local 
docker logs -f tangerine-client
