#!/bin/bash

set -e

echo "modules are: $T_MODULES"

isClass=$(echo "$T_MODULES" | sed 's/.*\(class\).*/\1/')

echo $isClass

if [ "$isClass" = "class" ]
    then echo "Yes, it's class"
    cp -R /tangerine/scripts/modules/class/. /tangerine/client/app/src/assets/
    cp /tangerine/scripts/modules/class/forms.json /tangerine/client/app/src/assets/
    cd /tangerine/client
    cd wrappers/pwa
    npm install
fi