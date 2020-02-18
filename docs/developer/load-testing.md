# Load testing

## Populate database

One may populate a Tangerine instance with records using the cli:

```
docker exec tangerine generate-uploads 500 group-uuid 2000 100 case-mother
```

That command generates 500 'case-mother' cases (each of which has 2 records) in batches of 100, posted every 2000 ms. The 'case-mother' switch uses templates stored in the 'response-templates' directory of that group in the data dir. (Read server/src/scripts/generate-uploads/bin.js for more details.)

## Push changed code

If you make modifications to your Angular code, run the following command while exec'd into the container:

```
cd /tangerine/client && rm -rf builds/apk/www/shell && rm -rf builds/pwa/release-uuid/app && cp -r dev builds/apk/www/shell && cp -r pwa-tools/updater-app/build/default builds/pwa && cp -r dev builds/pwa/release-uuid/app
```

## Build an APK

In editor, build an APK.

## Update and test

On the tablet, in the menu select "Check for Update" to update the code and then select "Sync Online" to download the records.

## Clean things up

To delete all generated records (but keep the views), use [bulkdelete](https://github.com/chrisekelley/scripts).

