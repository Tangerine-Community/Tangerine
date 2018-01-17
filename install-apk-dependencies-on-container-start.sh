
# Install cordova-plugin-whitelist otherwise the folllowing `cordova plugin add` fails with `Error: spawn ETXTBSY`.
cd /tangerine-server/client \
    && ./node_modules/.bin/cordova platform add android@5.X.X \
    && npm install cordova-plugin-whitelist \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-whitelist --save \
    && npm install cordova-plugin-geolocation \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-geolocation --save \
    && npm install cordova-plugin-camera \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-camera --save \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-crosswalk-webview --variable XWALK_VERSION="19+"
cd /tangerine-server/client && npm run build:apk 
