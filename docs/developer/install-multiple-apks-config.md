# Installing Multiple Tangerine apps on the same tablet

To install more than one Tangerine app on a tablet, you must configure the packageName and appName properties in the group's app-config.json

```json
"packageName": "org.rti.tangerine.lakana1",
"appName": "Lakana Lab Tests"
```

Using these properties would create an APK with the package name org.rti.tangerine.lakana1. The icon to launch the app would display "Lakana Lab Tests".

When uninstalling the app, you would use the updated package name:

```shell script
adb uninstall org.rti.tangerine.lakana1
```

If you don't add these properties, the defaults are:
- PACKAGENAME = "org.rti.tangerine"
- APPNAME = "Tangerine"



