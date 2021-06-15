# Commands

## Create group and generate case(es)

```shell
docker exec tangerine create-group "CM-1" case-module

docker exec tangerine generate-cases 1 group-09a2a880-1317-4cbf-b944-0fd059fa7007
```

## Open docker shell

```shell
docker exec -it tangerine bash
```

## Refresh code 

Run this inside tangerine docker shell

```shell
cd /tangerine/client && rm -rf builds/apk/www/shell 
&& rm -rf builds/pwa/release-uuid/app && cp -r dev builds/apk/www/shell 
&& cp -r pwa-tools/updater-app/build/default builds/pwa 
&& cp -r dev builds/pwa/release-uuid/app
```

## ADB commands

```shell
adb devices
```

```shell
adb install data/client/releases/prod/apks/group-09a2a880-1317-4cbf-b944-0fd059fa7007/platforms/android//app/build/outputs/apk/debug/app-debug.apk
```

```shell
adb uninstall org.rti.tangerine
```
