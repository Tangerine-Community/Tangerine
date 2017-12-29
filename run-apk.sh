docker exec -it tangerine-container /tangerine-server/client-v3/build.sh
docker exec -it tangerine-container mv /tangerine-server/client/platforms/android/build/outputs/apk/android-armv7-debug.apk /tangerine-server/tree/apks/dev.apk
adb uninstall org.rti.tangerine
adb install data/apks/dev.apk
