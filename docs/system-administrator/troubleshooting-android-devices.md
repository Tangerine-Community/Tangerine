# Troubleshooting Android Devices

## Modify the app-config.json on an Android Device
If an Android device is having trouble, you may want to tweak the app-config.json settings on that specific device. Use the following commands to pull the app-config.json file off the device, modify it on your computer, and then push it back to the device.

```sh
adb shell
run-as org.rti.tangerine
# Discover what the path to the release is (will be a datetime), then use for subsequent paths.
ls /data/user/0/org.rti.tangerine/files/cordova-hot-code-push-plugin/
cd /data/user/0/org.rti.tangerine/files/cordova-hot-code-push-plugin/2021.09.14-18.12.15/www/shell/assets
cp app-config.json /sdcard/Download/
exit
adb pull /sdcard/Download/app-config.json
# Time to modify app-config.json.
vim app-config.json
adb push app-config.json /sdcard/Download/
adb shell
run-as org.rti.tangerine
# Make sure to use that datetime path discovered earlier.
mv /sdcard/Download/app-config.json /data/user/0/org.rti.tangerine/files/cordova-hot-code-push-plugin/2021.09.14-18.12.15/www/shell/assets/
```
