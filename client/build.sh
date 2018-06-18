#!/bin/bash

set -e

cd app 
./node_modules/.bin/ng build --base-href "./"
cd ..

cd wrappers/pwa
npm run build
cp logo.svg build/default/
cd ../../

# Wrap up APK build.
# TODO: Where is the apk wrapper???
#cp -r wrappers/apk builds/apk
cp -r app/dist/tangerine-client builds/apk/www/app

# Wrap up PWA build.
cp -r wrappers/pwa/build/default builds/pwa
mkdir builds/pwa/release-uuid
cp -r app/dist/tangerine-client builds/pwa/release-uuid/app

# Wrap up Dev build.
cp -r wrappers/dev builds/dev
cp -r app/dist/tangerine-client builds/dev/app
