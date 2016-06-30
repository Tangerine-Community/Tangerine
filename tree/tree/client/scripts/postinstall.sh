# this script is run automatically after `npm install`

# handle for the cordova executable
cordova=../node_modules/.bin/cordova

# install the android platform
$cordova platform add android@5.X.X --save

# install plugins

# crosswalk for older browser versioni compatibility 
$cordova plugin add cordova-plugin-crosswalk-webview --save --variable XWALK_VERSION="19+"

# location services
$cordova plugin add cordova-plugin-geolocation --save

# whitelist to allow ajax calls to servers specified in config.xml
$cordova plugin add cordova-plugin-whitelist --save

npm run gulp init

$cordova build android