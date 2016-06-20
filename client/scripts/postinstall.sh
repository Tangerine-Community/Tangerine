# this script is run automatically after `npm install`

# handle for the cordova executable
cordova=../node_modules/.bin/cordova

# install the android platform
$cordova platform add android

# install plugins

# crosswalk for older browser versioni compatibility 
$cordova plugin add cordova-plugin-crosswalk-webview

# whitelist to allow ajax calls to servers specified in config.xml
$cordova plugin add cordova-plugin-whitelist

npm run gulp init
