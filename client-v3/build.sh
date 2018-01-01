#!/bin/bash
set -x

source ~/.nvm/nvm.sh && \
nvm use node

CONTENT_PATH="$1"

rm -r /tangerine-server/client-v3/build
mkdir /tangerine-server/client-v3/build

cd /tangerine-server/client-v3/shell
./node_modules/.bin/ng build --base-href "./"
mv dist /tangerine-server/client-v3/build/tangerine

cd /tangerine-server/client-v3/tangy-forms
npm run build
mv dist /tangerine-server/client-v3/build/tangy-forms

cp /tangerine-server/client-v3/android/index.html /tangerine-server/client-v3/build/

# cp -r "$CONTENT_PATH" /tangerine-server/client-v3/build/content
cp -r /tangerine-server/client-v3/content /tangerine-server/client-v3/build/content

mv /tangerine-server/client/www /tangerine-server/client/www-tmp
cp -r /tangerine-server/client-v3/build /tangerine-server/client/www

cd /tangerine-server/client
./node_modules/.bin/cordova build android
rm -r /tangerine-server/client/www
mv /tangerine-server/client/www-tmp /tangerine-server/client/www

