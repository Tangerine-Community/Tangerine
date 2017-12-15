rm -r /tangerine/client/containers/android/www
mkdir /tangerine/client/containers/android/www
cp /tangerine/client/containers/android/index.html-template /tangerine/client/containers/android/www/index.html
cp -r /tangerine/client/tangy-forms/dist /tangerine/client/containers/android/www/tangy-forms
cp -r /tangerine/client/shell/dist /tangerine/client/containers/android/www/tangerine
rm /tmp/archive.zip
cd /tangerine/client/containers/android && jszip --output /tmp/archive.zip .
curl -XPOST -F zip=@/tmp/archive.zip http://cordova-apk-server/upload
