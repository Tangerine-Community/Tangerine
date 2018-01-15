docker exec tangerine-container /tangerine-server/client-v3/build.sh
docker exec -it tangerine-container mv /tangerine-server/client/platforms/android/build/outputs/apk/android-armv7-debug.apk /tangerine-server/tree/apks/v3.apk
echo "You will find your APK at $(pwd)/data/apks/v3.apk"

