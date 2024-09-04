# What's new

## v4.0.2

__New Features__

- Merge functionality, fixes and updates from v3.31.0 and v3.31.1.

__Server upgrade instructions__

See the [Server Upgrade Insturctions](https://docs.tangerinecentral.org/system-administrator/upgrade-instructions).

*Special Instructions for this release:* 

- None

## v4.0.1

_New Features_

- New custom element - tangy-acuity-chart - for displaying optotypes in a chart format. 
  - This element takes the following properties:
    - `sequenceNumber` - the "score" you wish to display, such as 20/200. 
      - 20/10 corresponds to sequenceNumber="1".
      - 20/20 corresponds to sequenceNumber="4".
    - `characterName` - the name of the character to display, such as `LandoltC_W`
  - Usage:
    - Example `<tangy-acuity-chart name="acuity-score-2-4" sequenceNumber="1" characterName="LandoltC_W"></tangy-acuity-chart>`
      - The element will display the character "LandoltC_W" at the specified sequenceNumber.
      - If you wish to display 5 images of the same magnification (e.g. 20/20), you would use  sequenceNumber="4" for each image 
        and then change each image for each tangy-acuity-chart: - LandoltC_W, LandoltC_E, LandoltC_N, LandoltC_S, LandoltC_C.
      - If you wish for the images to get larger for the next 5 images, increment the sequenceNumber by 1. 
        For example, sequenceNumber="5" would display 20/50, and sequenceNumber="6" would display 20/12.
    - Each tangy-form-item should contain a single tangy-acuity-chart. See the demos of the [tangy-acuity-chart (Landholt-C)](./tangy-form/demo/tangy-acuity-chart.html) 
        and [tangy-acuity-chart (Auckland](./tangy-form/demo/tangy-acuity-chart-Auckland.html) optotypes.
    - The first time a form using tangy-acuity-chart loads, it displays the Configuration panel. Enter the following:
      - Notation - choose Feet or Metres
      - Distance - must be a number greater than 3000 mm.
      - Length of line below - must be a number greater than 200 mm.
    - The app will store these values in the browser's local storage so that they may be re-used the next time.
- Deployment has been improved - To update a deployment, make a release in the tangerine repo. This will trigger a build in the CI/CD pipeline. The CI/CD pipeline will build the docker images and push them to the docker registry.
  Do a `docker-compose pull` to get the latest images. Then run ./start-docker-compose.sh to start the new containers.
  You might need to remove the old containers before you do the pull in case they don't update.
- As mentioned in the v4.0.0 release notes, the file [new-tangerine-4-architecture.md](docs/system-administrator/new-tangerine-4-architecture.md) provides a detailed description of this new architecture.

__Server upgrade instructions__

If you are upgrading a Tangerine instance, run the server/src/upgrade/v4.0.0.sh script to update Cordova plugins.

```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. Ensure there is at least 10GB + size of the data folder amount of free space in order to perform the upgrade.
df -h
# Turn off tangerine and database.
docker stop tangerine couchdb
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout v4.0.1
# This is new! Pull the latest images.
docker-compose pull
./start-docker-compose.sh
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v4.0.0

# If you are upgrading a Tangerine instance, run the server/src/upgrade/v4.0.0.sh script to update Cordova plugins. 
./server/src/upgrade/v4.0.0.sh
```

## v4.0.0

Tangerine v4.0.0 is a major upgrade of the system architecture; it now features six docker containers: init, server, server-ui, apk-generator, nginx, and couchdb. It uses a docker-compose.yml to configure docker containers. Please review that file to become familiar this new architecture.
The file [new-tangerine-4-architecture.md](docs/system-administrator/new-tangerine-4-architecture.md) provides a detailed description of this new architecture.

Upgrading to this version or higher requires re-installation of all devices.

__NEW Features__

- Upgrades to Angular, Nest, and Cordova frameworks.
- The tangy-form and tangy-form-editor libraries are now a part of the Tangerine source code. 
- PouchDB upgrade to [v8.0](https://pouchdb.com/2022/12/14/pouchdb-8.0.0.html) and use the new IndexedDB adapter.
- If a project handles protected health information, the device must be encrypted. Tangerine no longer manages the encryption of records. See note below about "javascript-based encryption" for more information.
- The start scripts have been renamed: 
  - `start.sh` is now `start-docker-compose.sh`
  - `develope.sh` is now `develop-docker-compose.sh`
- The container image's Dockerfiles have been moved to the 'docker-build-files' directory.
- A script to perform Trivy code scanning is in the trivy directory. Scan reports are stored in data/trivy-reports.

__Fixes__
 - Editor:Spreadsheet Templates - If you choose a form that does not yet have any data, the application pops up an alert 
   that there is no data available yet for this form. When data is synced to the server, the CSV module will generate the 
   template file on the group-uuid-reporting database for that form. Issue: [#3519](https://github.com/Tangerine-Community/Tangerine/issues/3519)
   - Also fixed Spreadsheet request issue. Commit: [5e93c8e](https://github.com/Tangerine-Community/Tangerine/commit/5e93c8ee1d1519b455f8efc89064612eb5a65779)
 - Security: removed package-lock.json for generate-form-json. Issue: [#3524](https://github.com/Tangerine-Community/Tangerine/issues/3524) PR: [#3526](https://github.com/Tangerine-Community/Tangerine/pull/3526)
 - Security: removed package-lock.json from custom-app content set. Issue: [#3525](https://github.com/Tangerine-Community/Tangerine/issues/3525) PR: [#3526](https://github.com/Tangerine-Community/Tangerine/pull/3526)
 - Editor: Updated Login UI. Issue: [3531](https://github.com/Tangerine-Community/Tangerine/issues/3531)
 - Tangerine theme CSS rules are not being executed in client. Issue: [#3529](https://github.com/Tangerine-Community/Tangerine/issues/3529)
 - The javascript-based encryption has so far failed to deliver positive results; therefore, we are disabling this option. The new 'useAppLevelEncryption' property has been introduced to show that this feature is opt-in only. The 'turnOffAppLevelEncryption' property is no longer available. The default is to *not* use in-app encryption, which means that the administrator must enable System (disk) level encryption on the device. There is no encryption provided by Tangerine in eithewr PWA's or APK's; both platforms use the same IndexedDB adapter to save records, The APK-based "sqlcipher" plugin persistence has been removed.
 - Security: User can use JSON Web Token "None" Hashing Algorithm Issue: [#3618](https://github.com/Tangerine-Community/Tangerine/issues/3618)
 - Media library cannot upload photos. Issue:  [#3583](https://github.com/Tangerine-Community/Tangerine/issues/3583)
 - The /assets route is now protected. The Tangerine logo has its own route that permits access by all. 

__Server upgrade instructions__

If you are upgrading a Tangerine instance, run the server/src/upgrade/v4.0.0.sh script to update Cordova plugins. 


```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. Ensure there is at least 10GB + size of the data folder amount of free space in order to perform the upgrade.
df -h
# Turn off tangerine and database.
docker stop tangerine couchdb
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout v4.0.0
./start-docker-compose-linux.sh v4.0.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.1

# If you are upgrading a Tangerine instance, run the server/src/upgrade/v4.0.0.sh script to update Cordova plugins. 
./server/src/upgrade/v4.0.0.sh
```

