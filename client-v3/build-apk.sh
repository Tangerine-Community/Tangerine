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

# Glue.
mv /tangerine-server/client-v3/tangy-forms/dist /tangerine-server/client-v3/build/tangy-forms
mv /tangerine-server/client-v3/shell/dist /tangerine-server/client-v3/build/tangerine
cp -r /tangerine-server/client-v3/content /tangerine-server/client-v3/build/content
cp /tangerine-server/client-v3/android/index.html /tangerine-server/client-v3/build/

# Move aside v2 client code in Android project.
mv /tangerine-server/client/www /tangerine-server/client/www-tmp
cp -r /tangerine-server/client-v3/build /tangerine-server/client/www

# APK BUILD!
cd /tangerine-server/client
./node_modules/.bin/cordova build android

# Put v2 client back.
rm -r /tangerine-server/client/www
mv /tangerine-server/client/www-tmp /tangerine-server/client/www
