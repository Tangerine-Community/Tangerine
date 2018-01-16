#!/bin/bash
set -x

# Set node version.
source ~/.nvm/nvm.sh && \
nvm use 9

# Build.
rm -r /tangerine-server/client-v3/build
mkdir /tangerine-server/client-v3/build
cd /tangerine-server/client-v3/shell
./node_modules/.bin/ng build --base-href "./"
cd /tangerine-server/client-v3/tangy-forms
npm run build
cd /tagerine-server/client-v3/app-updater
npm run build

# Glue.
mv /tangerine-server/client-v3/tangy-forms/dist /tangerine-server/client-v3/build/tangy-forms
mv /tangerine-server/client-v3/shell/dist /tangerine-server/client-v3/build/tangerine
cp -r /tangerine-server/client-v3/content /tangerine-server/client-v3/build/content
cp /tangerine-server/client-v3/android/app-updater/build/* /tangerine-server/client-v3/build/

# Release.
cd /tangerine-server/client-v3/ \
  && ./node_modules/.bin/workbox generate:sw \
  && UUID=$(./node_modules/.bin/uuid) \
  && mv build/sw.js build/$UUID.js \
  && echo $UUID > build/release-uuid.txt \
  && echo "Release with UUID of $UUID"
