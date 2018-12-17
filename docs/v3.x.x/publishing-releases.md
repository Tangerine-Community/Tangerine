# Publishing releases

Using the release commands, you can feed them a secret for determining the URL which they are accessed and a path to the folder of content you would like to be included.

## APK

To release an APK with the default content, start the container and run the following command.
```
docker exec tangerine-container bash -c 'cd /tangerine-server/client-v3 && ./release-apk.sh foo ./content/default'
```
Then go to http://localhost/client-v3/releases/apks/foo.apk



## PWA

To release an PWA with the default content, start the container and run the following command.
```
docker exec tangerine-container bash -c 'cd /tangerine-server/client-v3 && ./release-pwa.sh foo ./content/default'
```
Then go to http://localhost/client-v3/releases/pwas/foo


## Adding custom content

On the host machine, place the custom content folder at `./data/client-v3/content/groups/<group name>`.

Then run...
```
docker exec tangerine-container bash -c 'cd /tangerine-server/client-v3 && ./release-pwa.sh foo ./content/groups/<group name>'
```


