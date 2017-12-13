# This script removes the current tangerine APK, replaces it with a new one and starts the application.
adb uninstall org.rti.tangerine
adb install ../platforms/android/build/outputs/apk/android-armv7-debug.apk
adb shell am start -n org.rti.tangerine/org.rti.tangerine.MainActivity
