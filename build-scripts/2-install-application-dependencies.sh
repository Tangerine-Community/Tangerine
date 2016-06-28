
set -v

echo $PATH
gem install bundler --no-ri --no-rdoc
cd /tangerine-server/brockman
bundle install --path vendor/bundle

# Install decompressor
cd /tangerine-server/decompressor
npm install

# Install editor
cd /tangerine-server/editor
npm install

# Install robbert
cd /tangerine-server/robbert
npm install
# explicitly install because npm doesn't care that it's included in package.json as a dependency 
npm install nano

# Install client
cd /tangerine-server/client
npm install
bower install --allow-root 

# Install tree
cd /tangerine-server/tree
npm install

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

# fix for Error: setgid group id does not exist
sed -i'' -r 's/^( +, uidSupport = ).+$/\1false/' /usr/lib/node_modules/npm/node_modules/uid-number/uid-number.js
