#!/usr/bin/env bash
# tree

set -v # set verbose

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo pwd = $(pwd)
cd $dir
npm install

cd client
echo pwd = $(pwd)

npm install
# workaround for sudo
#npm run tree-postinstall
# fix for Error: setgid group id does not exist
#sed -i'' -r 's/^( +, uidSupport = ).+$/\1false/' /usr/lib/node_modules/npm/node_modules/uid-number/uid-number.js