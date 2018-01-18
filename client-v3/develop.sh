#!/usr/bin/env bash

source ~/.nvm/nvm.sh
nvm use 8 

# @TODO Do a continous build instead of symlinking.
rm -r builds/dev/tangy-forms
ln -s $(pwd)/tangy-forms $(pwd)/builds/dev/tangy-forms

cd shell
./node_modules/.bin/ng build --base-href ./ --watch --output-path ../builds/dev/shell &
cd ..

cd builds/dev
hs -c-1


