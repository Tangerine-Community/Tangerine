
./build.sh
mv build android/www
cd android/
cordova platform add android
cordova build android
