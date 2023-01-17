docker exec -it tangerine bash

cd /tangerine/client/builds/apk
npm rm cordova-plugin-whitelist
cordova plugin rm cordova-plugin-whitelist
cordova platform rm android
cordova platform add android@11
cordova plugin add cordova-plugin-geolocation@4.1.0 --save && sleep 5
cordova plugin add cordova-plugin-camera@6.0.0 --save && sleep 5
cordova plugin add cordova-plugin-file@7.0.0 --save && sleep 5
cordova plugin add cordova-plugin-androidx --save && sleep 5
cordova plugin add cordova-plugin-androidx-adapter --save && sleep 5
cordova plugin add github:Tangerine-Community/cordova-hot-code-push --save && sleep 5
cordova plugin add cordova-plugin-nearby-connections@0.6.1 --save && sleep 5
cordova plugin add cordova-sms-plugin --save && sleep 5
cordova plugin add cordova-plugin-android-permissions --save && sleep 5
cordova plugin add github:brodybits/cordova-plugin-sqlcipher-crypto-batch-connection-manager-core-pro-free#unstable-build-2020-07-15-01 --save && sleep 5
cordova plugin add cordova-sqlite-storage-file --save && sleep 5
cordova plugin add cordova-plugin-x-socialsharing --save && sleep 5

echo "export JAVA_HOME=$(dirname $(dirname $(readlink -f $(type -P java))))" > /etc/profile.d/javahome.sh

cordova build