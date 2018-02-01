#!/usr/bin/env bash

# @TODO Do a continous build instead of symlinking.
rm -r builds/dev/tangy-forms
ln -s $(pwd)/tangy-forms $(pwd)/builds/dev/tangy-forms
ln -s $(pwd)/ckeditor $(pwd)/builds/dev/ckeditor

cd shell
./node_modules/.bin/ng build --base-href ./ --watch --output-path ../builds/dev/shell &
cd ..

cd builds/dev
../../node_modules/.bin/http-server -p 4200 -c-1
