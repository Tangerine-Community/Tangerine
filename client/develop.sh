#!/usr/bin/env bash

echo "Setting up the dev (browser) environment"

# @TODO Do a continous build instead of symlinking.
rm -r builds/dev/tangy-forms
ln -s $(pwd)/tangy-forms $(pwd)/builds/dev/tangy-forms
ln -s $(pwd)/ckeditor $(pwd)/builds/dev/ckeditor

cd shell
./node_modules/.bin/ng build --base-href ./ --watch --output-path ../builds/dev/shell &
cd ..

echo "Now let's make APK's"

rm -r $(pwd)/builds/apk/www/shell
ln -s $(pwd)/builds/dev/shell $(pwd)/builds/apk/www/shell

echo "Launch the http server"

cd builds/dev
../../node_modules/.bin/http-server -p 4200 -c-1




