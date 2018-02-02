#!/bin/bash

cd shell
./node_modules/.bin/ng build --base-href "./"
cd ..

cd tangy-forms
npm run build 
cd ..

cd wrappers/pwa
npm run build
cp logo.svg build/default/
cd ../../

rm -r builds
mkdir builds

# Wrap up APK build.
cp -r wrappers/apk builds/apk
cp -r tangy-forms/dist builds/apk/www/tangy-forms
cp -r shell/dist builds/apk/www/shell
cp -r content/default builds/apk/www/content

# Wrap up PWA build.
cp -r wrappers/pwa/build/default builds/pwa
cp -r tangy-forms/dist builds/pwa/tangy-forms
cp -r shell/dist builds/pwa/shell
cp -r content/default builds/pwa/content

# Wrap up Dev build.
cp -r wrappers/dev builds/dev
cp -r tangy-forms/dist builds/dev/tangy-forms
cp -r shell/dist builds/dev/shell
cp -r content/default builds/dev/content
