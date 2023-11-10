# What's new

## v3.30.1

__New Feautres__
- Multiple Location Lists can be configured using the Tangerine server web interface
-- Create and manage location lists for use in Tangerine forms
-- The default location list is used for device and device user assignment

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. 
df -h
# If there is not more than 12 GB plus the size of the data folder, create more space before proceeding. 
# Good candidates to remove are: data back-up folders and older versions of the Tangerine image
# rm -rf ../data-backup-<date>
# docker rmi tangerine/tangerine:<version>
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout -b v3.30.1 v3.30.1
./start.sh v3.30.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:<previous_version>
```

## v3.30.0

__New Features__
- The 'teach' content-set now supports an optional 'Attendance' feature, enabled by adding `"useAttendanceFeature": true` 
 to app-config.json. It also has a new view, 'responsesForAttendanceByClassId', an 'Attendance and Behaviour' subtest menu 
 item which enables collection of those values per student, and an 'Attendance' report. 
- New app-config.json configuration for teach properties:
  ```js
  "teachProperties": {
    "units": ["unit 1", "unit 2", "unit 3"],
    "cutoffRange": "10"
  }
  ```
- Updated docker-tangerine-base-image to v3.8.0, which adds the cordova-plugin-x-socialsharing plugin and enables sharing to WhatsApp.


__Fixes__
- Fixed PWA assets (sound,video) only work when online [#1905](https://github.com/Tangerine-Community/Tangerine/issues/1905)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. 
df -h
# If there is not more than 12 GB plus the size of the data folder, create more space before proceeding. 
# Good candidates to remove are: data back-up folders and older versions of the Tangerine image
# rm -rf ../data-backup-<date>
# docker rmi tangerine/tangerine:<version>
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout -b v3.30.0 v3.30.0
./start.sh v3.30.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:<previous_version>
```


## v3.29.0

__New Features__
- Case, Event and Form Archive and Unarchive

We have released an update to Tangerine which allows for the archiving and un-archiving of both events, and forms within events. This is an extension of the already existing functionality by which an entire case can be archived. The purpose of this is to empower data management teams using Tangerine to "clean up" messy cases where extraneous data has been added to a case in error, or by a conflict situation. The purpose of this document is to summarize both the configuration to enable this, and to demonstrate the use of these functions. This functionality will only apply to the web-based version of Tangerine, and will not be available on tablets.

__Package Updates__
- Updated tangy-form to v4.40.0

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. 
df -h
# If there is not more than 12 GB plus the size of the data folder, create more space before proceeding. 
# Good candidates to remove are: data back-up folders and older versions of the Tangerine image
# rm -rf ../data-backup-<date>
# docker rmi tangerine/tangerine:<version>
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout -b v3.29.0 v3.29.0
./start.sh v3.29.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:<previous_version>
```

## v3.28

- This became v4

## v3.27.8

__New Features__
- New server configuration setting for output value of optionally not answered questions
  - The value set in the config variable `T_REPORTING_MARK_OPTIONAL_NO_ANSWER_WITH` in `config.sh` will be the value of questions that are optional and not answered by the respondent.
  - The default value is "SKIPPED" for consistency with previous outputs
- CSV outputs now include the metadata variables `startDateTime` and `endDateTime`  auto-calculated from the `startUnixTime` and `endUnixTime` variables
- Additional parameter for the csv data set generation process to ignore `user-profile` and `reports` from the output csv files

__Fixes__
- Copy all media directories from the client form directories to ensure assets are available in online surveys
- Allows form developers to publish images and sounds in online surveys
- Fix the language dropdown in online surveys
- Outputs will no longer try to process outputs for `TANGY-TEMPLTE` inputs

__Breaking Changes__
- Removes build dependencies for legacy python `mysql` output module
  - For those using the legacy module, [see the documentation move to the new `mysql-js` module](https://docs.tangerinecentral.org/system-administrator/mysql-js/)

__Package Updates__
- Lock @ts-stack/markdown to 1.4.0 to prevent breaking of builds

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout -b v3.27.8 v3.27.8
./start.sh v3.27.8
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.7
```

## v3.29.0

__New Features__
- Case, Event and Form Archive and Unarchive

We have released an update to Tangerine which allows for the archiving and un-archiving of both events, and forms within events. This is an extension of the already existing functionality by which an entire case can be archived. The purpose of this is to empower data management teams using Tangerine to "clean up" messy cases where extraneous data has been added to a case in error, or by a conflict situation. The purpose of this document is to summarize both the configuration to enable this, and to demonstrate the use of these functions. This functionality will only apply to the web-based version of Tangerine, and will not be available on tablets.

__Package Updates__
- Updated tangy-form to v4.40.0

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

```
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space. 
df -h
# If there is not more than 12 GB plus the size of the data folder, create more space before proceeding. 
# Good candidates to remove are: data back-up folders and older versions of the Tangerine image
# rm -rf ../data-backup-<date>
# docker rmi tangerine/tangerine:<version>
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
# Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server. 
docker logs --since=60m tangerine
# Fetch the updates.
git fetch origin
git checkout -b v3.29.0 v3.29.0
./start.sh v3.29.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:<previous_version>
```

## v3.28.X

- Became v4.0

## v3.27.7

__Fixes__
- Enable mysql-js module outputs for online-survey app data

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout -b v3.27.7 v3.27.7
./start.sh v3.27.7
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.6
```


## v3.27.6

__Fixes__
- Address issues using the CaseService `createCaseEvent` API in `on-submit` logic by making the function synchronous

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.6
./start.sh v3.27.6
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.5
```


## v3.27.5

__Fixes__
- CSV Generation: Fix permissions on generate csv batch script

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.5
./start.sh v3.27.5
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.4
```


## v3.27.4

__Fixes__
- Synchronization: Update Reduce Batch Size button to apply during normal sync for pull and push

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.4
./start.sh v3.27.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.3
```

## v3.27.3

__Fixes__
- Fix running the `reporting-cache-clear` command on the `mysql-js` module
- Extend the particpantID key to 80 chars to handle long keys for T_MYSQL_MULTI_PARTICIPANT_SCHEMA
    - For those using `mysql-js`: This change requires running `reporting-cache-clear` to take effect.
- Fix missing groupId in user-profile PR: [#3494](https://github.com/Tangerine-Community/Tangerine/pull/3494)
  - This bugfix added groupId to the user-profile.
  - In mysql-js, it also throws an error when groupId is missing. [Relevant commit](https://github.com/Tangerine-Community/Tangerine/pull/3494/files#diff-84876aa37057bd8bf558b8f60d01b30821e3dbfd53ba442d5a74432822ceb11bR779). This is different from earlier behavior, which lets the document pass without an error. All docs should have a groupId. 


__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.2
./start.sh v3.27.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.2
```

## v3.27.2

__Fixes__
- Tangerine on Android APK ignore requestFullscreen() [#3539](https://github.com/Tangerine-Community/Tangerine/issues/3539)
- This fix above also adds a new app-config.json property - `exitClicks` - enables admin  to set number of clicks to exit kioskMode.
- Fixed: Tangy-radio button and tangy keyboard do not render on Online survey [#3551](https://github.com/Tangerine-Community/Tangerine/issues/3551)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.2
./start.sh v3.27.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.1
```

## v3.27.1

__Fixes__
- Limit debugging logs in csv generation to prevent exec from hitting max_buffer issue
- Add protection to use of onEventOpen and onEventClose API

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.1
./start.sh v3.27.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.27.0
```

## v3.27.0

__NEW Features__
- Update triggers for Case API hooks

The Case Service API has a set of functions that are triggered on events. An implementer of Tangerine using the Case module can add these triggers to their case definition json in order to hook into these actions. The variable name to add is the trigger, e.g. `onCaseOpen` and the value is valid javascript that will run when the trigger is fired. The following changes were made to the hooks:

-- `onCaseClose` hook will fire when the case is closed by the user by clicking the 'X' in the upper-left corner
-- `onCaseOpen` hook will fire when the case is opened (no change)
-- `onEventOpen` has been changed to fire when a Case Event is clicked on the Case Summary page
-- `onEventClose` has been changed to fire when the Event page is closed
-- `onEventCreate` has been added and will fire when the user creates a new event using the dropdown in the Case Summary page
-- `onEventFormOpen` has been added and will fire when the user opens a form from the Event page
-- `onEventFormClose` has been added and will fire when the user closes a form

__Fixes__
- Check for custom search js when creating user dbs (Tangerine Preview)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.27.0
./start.sh v3.27.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.26.2
```

## v3.26.2

__DEPRECATION NOTICE AND UPCOMING MODULE DELETION__

The mysql module is deprecated; it will be removed *soon* from this source code in the v3.28.0 release. 
We have been using the mysql-js in production for a few months and it is more performant 
and reliable than the output of the mysql module. We recommend switching to the mysql-js module. 
See the [MySQL-JS Module doc](./docs/system-administrator/mysql-js.md) for upgrade and configuration information.

__New Features__
- New group content-set dropdown: PR 3275 - https://github.com/Tangerine-Community/Tangerine/pull/3275 - enables a content-set dropdown and is already in main. Modify the template (content-sets-example.json) and rename to content-sets.json to enable the dropdown.

__Fixes__
- Created Feedback dialog to resolve layout issue on mobile devices PR: [#3533](https://github.com/Tangerine-Community/Tangerine/pull/3533)
- Fix for Class listing breaks if you archive all classes in Teach; unable to add new classes. Issue: [#3491](https://github.com/Tangerine-Community/Tangerine/issues/3491)
- Fix for Mysql tables not populating; ER_TOO_BIG_ROWSIZE error in Tangerine logs. Issue: [#3488](https://github.com/Tangerine-Community/Tangerine/issues/3488)
- Changed location of mysql-js config file to point to the mysql-js directory. Also increased memory parameters in conf.d/config-file.cnf. 
- If you are using the mysql container and are having errors with very large forms, the new settings in ./server/src/mysql-js/conf.d/config-file.js
  should help. You will need to completely rebuild the mysql database. See the "Resetting MySQL databases" section in the [MySQL-JS Module docs](./docs/systems-administrator/mysql-js.md).
- Important: If you already have a mysql instance running and don't want to rebuild the mysql database, delete the `innodb-page-size=64K`
  line from ./server/src/mysql-js/conf.d/config-file.js; otherwise, your mysql instance will not start. 
- Fix for CSV Download fails with larger forms. Issue: [#3483](https://github.com/Tangerine-Community/Tangerine/issues/3483)

__Backports__

The following feature was backported from v3.24.6 patch release:

- T_UPLOAD_WITHOUT_UPDATING_REV : A new config.sh setting for use in high-load instances using sync-protocol-1.
  *** Using this setting COULD CAUSE DATA LOSS. ***
  This setting uses a different function to process uploads that does not do a GET before the PUT in order to upload a document.
  Please note that if there is a conflict it try to POST the doc which will create a new id and copy the _id to originalId.
  If that fails, it will log the error and not upload the document to the server, but still send an 'OK' status to client.
  The failure would result in data loss.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.26.2
./start.sh v3.26.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.26.1
```

## v3.26.1

__NEW Features__
- New configuration parameter: `T_LIMIT_NUMBER_OF_CHANGES` - Number of change docs from the Couchdb changes feed queried 
  by reporting-worker (i.e. use as the limit parameter). Default: 200.
- Added volume mapping for translations dir in start script. 
- A new `mysql-js` module replaces the old `mysql` module. Documentation is [here](https://docs.tangerinecentral.org/system-administrator/mysql-js/). 
  The new `mysql-js` module is faster and more accurate than the old `mysql` module. It no longer uses an intermediate 
  "group-uuid-mysql" couchdb; instead, it reads from the _changes feed and writes directly to a 
  MySql database. To use the new module, add `mysql-js` to the T_MODULES list of modules and configure the following settings:
  - T_MYSQL_CONTAINER_NAME="mysql" # Either the name of the mysql Docker container or the hostname of a mysql server or AWS RDS Mysql instance.
  - T_MYSQL_USER="admin" # Username for mysql credentials
  - T_MYSQL_PASSWORD="password" # Password for mysql credentials
  - T_USE_MYSQL_CONTAINER="true" # If using a Docker container, set to true. This will automatically start a mysql container 
    when using a Tangerine launch script.

__Fixes__
- Student subtest report incorrect for custom logic inputs [#3464](https://github.com/Tangerine-Community/Tangerine/issues/3464)
- Init paid-worker file when server restarted. 
- Fix bug in start.sh script for --link option
- Rename T_REBUILD_MYSQL_DBS to T_ONLY_PROCESS_THESE_GROUPS. Configure T_REBUILD_MYSQL_DBS to list group databases to be 
  skipped when processing data through modules such as mysql and csv.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.26.1
./start.sh v3.26.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.26.0
```

## v3.26.0

__NEW Features__

- MySQL JS Module: 
-- Track and output changes through the CouchDB Changes Feed
-- Connect to a MySQL Server of your choice via a url and credentials
- Add app-config flag to force confirmation of each form response created on the client
- Update to tangy-form and tangy-form-editor which enables configuration of automatic scoring in Editor for groups using Class. Issue: [#1021](https://github.com/Tangerine-Community/Tangerine/issues/1021)
- Documented a list of  [Reserved words in Tangerine](./docs/editor/reserved-words.md)
- Bump docker-tangerine-base-image to v3.7.4 (enables RECORD_AUDIO permission for APK's), tangy-form to 4.38.3, tangy-form-editor to 7.15.4.

__Fixes__

- Add protection when using Case APIs that load other cases than the currently active case
- feat(custom-scoring): If customScore exists, use it [#3450](https://github.com/Tangerine-Community/Tangerine/pull/3450
- fix(record-audio): Request audio permissions [#3451](https://github.com/Tangerine-Community/Tangerine/pull/3451)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.26.0
./start.sh v3.26.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.26.0
```

## v3.25.1

__Fixes__

- Fix logic in has merge change permissions

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.25.1
./start.sh v3.25.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.25.1
```


## v3.25.0

__NEW Features__

- Improvements to Issues on the Client and Server [3413](https://github.com/Tangerine-Community/Tangerine/pull/3413)
-- Add app-config flag to allow client users to Commit changes to Issues
-- Add user-role permissions to select which events or forms Issue changes can be commited on the client
-- Pull form responses changed in Issues on the server down to the client
- Add parameter to CSV Dataset Generation that allows exclusion of archived form definitions

__Fixes__

- Apply isIssueContext correctly on the client

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.25.0
./start.sh v3.25.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.25.0
```

## v3.24.6

__NEW Features__

- T_UPLOAD_WITHOUT_UPDATING_REV : A new config.sh setting for use in high-load instances using sync-protocol-1. 
  *** Using this setting COULD CAUSE DATA LOSS. ***
  This setting uses a different function to process uploads that does not do a GET before the PUT in order to upload a document. 
  Please note that if there is a conflict it will copy the _id to originalId and POST the doc, which will create a new id. 
  If that fails, it will log the error and not upload the document to the server, but still send an 'OK' status to client. 
  The failure would result in data loss.

## v3.24.4

__NEW Features__

- Ability to add scoring from the interface (24 hours) [#1021](https://github.com/Tangerine-Community/Tangerine/issues/1021)


__Fixes__

- User is forced to stay on form until submission [#3215] - changed current-form-id to incomplete-response-id
- Bumped tangy-form to 4.37.0 and tangy-form-editor to 7.14.11.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.24.4
./start.sh v3.24.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.24.3-final
```
## v3.24.3-final

Please note that this release is tagged v3.24.3-final, not v3.24.3. This is a deviation from our usual format; we will resume the previous format in the next release.

__New Feature__
- To force user to stay on form until submission, set `"forceCompleteForms":true' in the group app-config.json. Issue: [#3215](https://github.com/Tangerine-Community/Tangerine/issues/3215)

__Fixes__
- Separate Archived and Active forms in Request Spreadsheet screen [#3222](https://github.com/Tangerine-Community/Tangerine/issues/3222)
- When incomplete results upload is enabled on a group, do not save empty record when using sync-protocol 1. [#3360](https://github.com/Tangerine-Community/Tangerine/issues/3360)
- Enable editing the "No" confirmation alert for tangy-consent [#3025](https://github.com/Tangerine-Community/Tangerine/issues/3025)
- Fix Sync error caused by async directory error when creating media directories [#3374](https://github.com/Tangerine-Community/Tangerine/issues/3374)
- Exclude client-uploads folder from APK and PWA releases [#3371](https://github.com/Tangerine-Community/Tangerine/issues/3371)
- Remove ordering of inputs when creating spreadsheets [#3252](https://github.com/Tangerine-Community/Tangerine/issues/3252)
- Bumped tangy-form-editor to v7.14.8 to add Video Capture input warning text [#3376](https://github.com/Tangerine-Community/Tangerine/issues/3376)
- Bumped tangy-form to [4.36.3](https://github.com/Tangerine-Community/tangy-form/releases/tag/v4.36.3).
- Updated the online-survey-app routing to route to a specific form, and also adds an optional routing option. PR:[#3387](https://github.com/Tangerine-Community/Tangerine/pull/3387)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.24.3-final
./start.sh v3.24.3-final
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.24.2
```

## v3.24.2

__Fixes__
- Hide Case Events form the Schedule View that are 'inactive'
- Add the 'endUnixTimestamp' to mysql outputs generated by the python module
- Remove unnecessary and expensive query for conflicts during synchronization on the client PR: [#3365](https://github.com/Tangerine-Community/Tangerine/pull/3365/files)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.24.2
./start.sh v3.24.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.24.1
```

## v3.24.1

__New Features__

- Feature: New version of mysql module, called mysql-js, which is coded in javascript instead of python. This module exports records much faster than previous version. It should also use much less memory and provide more flexibility in terms of column data types and (eventually) support of different types of databases. Issue: [#3047](https://github.com/Tangerine-Community/Tangerine/issues/3047)
- Feature: Enable upload of files created by the tangy-photo-capture and tangy-video-capture inputs. PR: [#3354](https://github.com/Tangerine-Community/Tangerine/pull/3354)
  Note:  In order to cause minimal negative impact upon current projects, the default behavior will be to save image files created by the tangy-photo-capture input to the database, instead of saving to a file and uploading. That being said, it is preferable to save as a file and upload. To over-ride this default, set the new `mediaFileStorageLocation` property to 'file' in the group's app-config.json. The default is 'database'. If this property is not defined, it will save to the database. New groups will be created with
  `mediaFileStorageLocation` set to 'file'. Videos created using the tangy-video-capture input will always be uploaded to the server due to their large file size. 

__Fixes__
- The default password policy (T_PASSWORD_POLICY in config.sh) has been improved to support most special characters and the T_PASSWORD_RECIPE description has been updated to list the permitted special characters. Issue: https://github.com/Tangerine-Community/Tangerine/issues/3299

  Example:

```shell
(\` ~ ! @ # $ % ^ & * ( ) \ - _ = + < > , . ; : \ | [ ] { } )
```

- Enable forms without location to be viewed in visits listing. PR: [#3347](https://github.com/Tangerine-Community/Tangerine/pull/3347)
- Fix results with cycle sequences that do not generate a CSV file. Issue: [#3249](https://github.com/Tangerine-Community/Tangerine/issues/3249) PR: [3345](https://github.com/Tangerine-Community/Tangerine/pull/3345)
- Enable grids to be hidden based on skip logic [#1391](https://github.com/Tangerine-Community/Tangerine/issues/1391)
- Add confirmation to consent form if 'No' selected before the form is closed [#3025](https://github.com/Tangerine-Community/Tangerine/issues/3025). Activate this feature using the new property: `confirm-no="true"`.
- Fix app config doNotOptimize logic PR: [#3358](https://github.com/Tangerine-Community/Tangerine/pull/3358)
- Those using the `doNotOptimize` flag **must** reverse the logic in the `appConfig.sh` file when updating to this version


__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.24.1
./start.sh v3.24.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.24.0
```

## v3.24.0

__New Features__

- App user can reduce the batch size as a workaround when experiencing 'out-of-memory' errors with Rewind Sync
  - On occasion Rewind Sync will fail to complete due to 'out-of-memory' issues. The Advanced Sync section of the Sync page now shows a checkbox that when checked will reduce the batch sizes used to perform the Rewind Sync. As noted in the UI, the Rewind Sync will take longer to process however in most cases it will be able to complete the process. The batch size reduction will be reverted once the Rewind Sync is complete or the user unchecks the box.
- System Admin can scan a QR code to download an APK or PWA release
  - When deploying Tangerine, it can be a long process to download and install the APK or PWA on multiple devices. To improve the deployment process, the Release tables now show a QR code that when scanned will download the release directly to a new device without the need to type in the URL.
- Improvements to Sync: In case of false positives on push, keep pushing until nothing is pushed
- Client Case Service API:
  - Case Event and Event Form (De)activation [3334](https://github.com/Tangerine-Community/Tangerine/pull/3334)
    - activateCaseEvent:  Marks a Case Event as 'active' and shows it in the Case Event list
    - deactivateCaseEvent: Marks a Case Event as 'inactive' and hides it in the Case Event list
    - activateEventForm:  Marks an Event Form as 'active' and shows it in the Event Form list
    - deactivateEventForm: Marks an Event Form as 'inactive' and hides it in the Event Form list
- Editor Case Service API:
  - Add useful APIs used in the client Case Service API to the editor Case Service API [3325](https://github.com/Tangerine-Community/Tangerine/pull/3325/files)
- Option to sync a case before viewing it [3237](https://github.com/Tangerine-Community/Tangerine/pull/3237)
- Support for showing photo and signatures in Issues

__Fixes__

- Fix after update messaging and async issues

__Translations__
- Include Vietnamese translations

__Deprecations__
- Comparison Sync has been removed from this release to reduce confusion reported by Tangerine users. The Rewind Sync functionality out-performs Comparison Sync and is recommended for use when needed on all deployments.

## v3.23.1

__Fixes__

- Fixed bug in sync on PWA's. Also, do note that video file upload using the new tangy-form input `<tangy-video-capture>` only works for APKs Issue: [#3338] https://github.com/Tangerine-Community/Tangerine/issues/3338
- Fixed tangy-form-editor to 7.14.2 to fix bug with input widget for tangy-keyboard-input (postfix field).

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.23.1
./start.sh v3.23.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.23.0
```

## v3.23.0

__New Features__

- Enabled video upload feature which uses the new tangy-form input `<tangy-video-capture>`. There is a new video file upload section in the sync feature for both sync-protocol 1 and 2. implementation details in this PR: [3327](https://github.com/Tangerine-Community/Tangerine/pull/3327/files). Issue: [#3212](https://github.com/Tangerine-Community/Tangerine/issues/3212) The new tangy-form input `<tangy-video-capture>` takes the following properties:
  - frontCamera: Boolean. Whether to use the front camera or the back camera. Default is `true`.
  - noVideoConstraints: Boolean. Whether to force use of front or back camera. If true, chooses the first available source.  Default is `true`.
  - codec: String. The codec to use. Default is 'video/webm;codecs=vp9,opus' - AKA webm vp9. It is possible the device may not support all of these codecs. Other potential codecs include `video/webm;codecs=vp8,opus` and `video/webm;codecs=h264,opus`.
  - videoWidth: Number. The width of the video. Default is `1280` and videoHeight: Number. The height of the video. Default is `720`.
- Bump tangy-form lib to 4.34.3, tangy-form-editor to 7.14.1. 

__Fixes__

- Add postfix property to tangy-keyboard-input. Also add highlight to value entered. Issue: [3321](https://github.com/Tangerine-Community/Tangerine/issues/3321)

## v3.22.4

__New Features__

- Feature: Tangerine CLI for dropping mysql tables and resetting mysql .ini files. PR: [#3281](https://github.com/Tangerine-Community/Tangerine/issues/3281)
  Usage: `docker exec tangerine module-cache-clear mysql`

__Fixes__

- Error when mysql module creates a table with duplicate participantId PR: [#3279](https://github.com/Tangerine-Community/Tangerine/pull/3280) 
- New languages - Bengali, Dari, Hindi, Pashto, Portuguese, Updated Russian, Swahili, Urdu [#3263](https://github.com/Tangerine-Community/Tangerine/pull/3263)
- Filter archived case events out of Schedule View [#3267](https://github.com/Tangerine-Community/Tangerine/pull/3267)
- Many fixes to Teach:
  - Add Current Date to Teach Subtest Report [#3273](https://github.com/Tangerine-Community/Tangerine/pull/3273)
  - Remove some appended Teach CSV columns [#3271](https://github.com/Tangerine-Community/Tangerine/pull/3271)
  - Fix student subtest report failing by transforming data only for related curriculum [#3272](https://github.com/Tangerine-Community/Tangerine/pull/3272)
  - Student subtask report is failing with error [#3270](https://github.com/Tangerine-Community/Tangerine/issues/3270)
  - CSV file contains tangy-input metadata and displaces all inputs [#3227](https://github.com/Tangerine-Community/Tangerine/issues/3227)
  - Fix summary upload [#3265](https://github.com/Tangerine-Community/Tangerine/pull/3265)
  - Records should be one doc per Student per Curriculum per Class. Not per Student per Curriculum per Class per Item. [#3264](https://github.com/Tangerine-Community/Tangerine/pull/3264)
  - Provide Bengali number translation in Student Grouping Report [#3255](https://github.com/Tangerine-Community/Tangerine/pull/3255)
  - Bengali numbers are not being replaced in Class Grouping report [#3228](https://github.com/Tangerine-Community/Tangerine/issues/3228)


__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.22.4
./start.sh v3.22.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.22.3
```


## v3.22.3

__Fixes__

- Fix all Tangy Templates are missing when reviewing completed form responses.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.22.3
./start.sh v3.22.3
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.22.2
```

## v3.22.2

__Fixes__

- Download All button on Spreadsheet Request info page does not download [#3232](https://github.com/Tangerine-Community/Tangerine/issues/3232)
- Spreadsheet Requests page does not load for new groups [#3233](https://github.com/Tangerine-Community/Tangerine/issues/3233)
- Fix use of window.eventFormRedirect [#3211](https://github.com/Tangerine-Community/Tangerine/pull/3211)
- Spreadsheet Request will fail to generate Download All zip if one form has specific characters in the title [#3217](https://github.com/Tangerine-Community/Tangerine/issues/3217)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.22.2
./start.sh v3.22.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.22.1
```

## v3.22.1

__Fixes__

- Fix: Tangy Template elements all say "false" if using environment variables like caseService and T [#3203](https://github.com/Tangerine-Community/Tangerine/issues/3203)
- Make issue diffs less crash prone [#3200](https://github.com/Tangerine-Community/Tangerine/pull/3200)
- Fix: Case fails to open after selecting Case in search behind a "load more" button [#3194](https://github.com/Tangerine-Community/Tangerine/issues/3194)
- Fix: Unable to scroll to last item in search list if there is not more button [#3195](https://github.com/Tangerine-Community/Tangerine/issues/3195)
- Fix: After typing a search, "load more" button appears with no search results for a few seconds [#3196](https://github.com/Tangerine-Community/Tangerine/issues/3196)
- On a Spreadsheet Request page, style the download all button's icon as white.
- Unify and fix the exclude pii label on spreadsheet requests.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
git checkout v3.22.1
./start.sh v3.22.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.22.0
```

## v3.22.0

__Fixes__

- Device User should not be able to register Device Account without username [#3162](https://github.com/Tangerine-Community/Tangerine/issues/3162)
- CSV Datasets are not filtering by month and year when a 'Month' and 'Year' is selected [#3181](https://github.com/Tangerine-Community/Tangerine/issues/3181)
- Make Loc and t available on Editor's window object for consistency with Client environment [#3161](https://github.com/Tangerine-Community/Tangerine/pull/3161)
- Fix messaging during data optimization and reduce number of view optimized that are never used [#3165](https://github.com/Tangerine-Community/Tangerine/pull/3165)
- Prevent menu items from jumping around on Deploy page [#3169](https://github.com/Tangerine-Community/Tangerine/pull/3169)
- Fix bug causing document updates to get skipped over in sync after a Comparison Sync [#3179](https://github.com/Tangerine-Community/Tangerine/pull/3179)

__Deprecate single csv download in favor of Spreadsheet Requests__

See [screenshots here](https://github.com/Tangerine-Community/Tangerine/pull/3182).

- Change terminology referring to "CSV" to more commonly recognized "Spreadsheet" term.
- "CSV Datasets" term changed to "Spreadsheet Requests".
- Fix "CSV Datasets are not filtering by month and year when a 'Month' and 'Year' is selected #3181"
- Request Spreadsheets page: Submit button now hovers and is sticky to bottom of page; "*" in Month/Year selection clarified as "All months"/"All years"; "Description" no longer required and given own line for better formatting; other formatting cleanup.
- Data page: Removed deprecated CSV Download button; updated language; added "Request Spreadsheets" button for quick access to making a request for spreadsheets.
- Spreadsheet Request Info page: Now dynamically updates as Spreadsheets are rendered with row counts and status; removed unnecessary filename to download all, instead it's a "download all" button; new types of status including "File removed", "Stopped", "Available", and "In progress"; Month and Year values of "*" now clarified as "All months" and "All years"; loading screen improvements; title of page now the date the spreadsheets were requested on.
- Spreadsheet Requests page: Updated language; fixed total Spreadsheet Requests calculation in pagination; if status of Spreadsheet Request is "Available" the status shows in green; if the status of the Spreadsheet Request is "In progress" a spinner is shown where the Download button will be; labels of "More Info" and "Download" added to corresponding buttons; loading overlay now shown on initial load and when changing pages.
- Spreadsheet Templates page: Updated terminology from CSV Templates to Spreadsheet Templates.

__New Features__

- Show recent activity as default search results [#3171](https://github.com/Tangerine-Community/Tangerine/pull/3171)
- Make a cached version of the Device information available to form logic on T.device.device [#3183](https://github.com/Tangerine-Community/Tangerine/pull/3183)
- Group Administrator configures Device Account password policy [#3172](https://github.com/Tangerine-Community/Tangerine/pull/3172)
- On search UI: limit initial results to 10 for fast load, add a "Load More" button for pagination, and style improvements [#3164](https://github.com/Tangerine-Community/Tangerine/pull/3164)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.22.0
./start.sh v3.22.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.21.0
```

## v3.21.0

__Developers:Good to Know__

- The master branch has been moved to the main branch. No development will happen on the master branch, which has been deleted. Also, please note the updates to the [Release Workflow](https://github.com/Tangerine-Community/Tangerine/blob/main/CONTRIBUTING.md#release-workflow)

__Fixes__

- Prevent unnecessary CaseService saves by comparing hashes [#3155](https://github.com/Tangerine-Community/Tangerine/pull/3155)
- Prevent loss of case changes when leaving incomplete form by always saving the case [#3156](https://github.com/Tangerine-Community/Tangerine/pull/3156)
- Prevent on-submit of a form running in one Case from being able to run in another case by navigating quickly to another Case. We inject `T` and `case` (caseService) variables into Tangy Form (formPlayer) from EventFormComponent. This will add `instanceFrom:  'EventFormComponent'` to the caseService (and also assigns `['instanceFrom'] = 'EventComponent'` in EventComponent). Note that if you have any use of `window.T` or `window.caseService`, you will need to make them `T` and `caseService` to take advantage of this fix. Commit: [716bc5e9](https://github.com/Tangerine-Community/Tangerine/commit/716bc5e90ec6fba59cbe55eb2bcf5ae244cf5fa8)
- Bump tangy-form to v4.29.1 and tangy-form-editor to v7.10.2 Commit: [a3f785310](https://github.com/Tangerine-Community/Tangerine/pull/3159/commits/a3f7853105882a7d0960c64f11816c6fea7b2163)

__New Features__

- Add support for running an SSL frontend. Issue: [#3147](https://github.com/Tangerine-Community/Tangerine/issues/3147)
- Make CORS settings configurable by T_CORS_ALLOWED_ORIGINS Commit: [1f448f7e](https://github.com/Tangerine-Community/Tangerine/pull/3159/commits/1f448f7efe8d55daeb6f63fa94cb29faaa0583c6)
- Add ability to generate CSV datasets for all groups and all forms. This feature provides the new generate-csv-datasets command and csvDataSets route. [#3149](https://github.com/Tangerine-Community/Tangerine/pull/3149)
- Add support for Tangy Form's useShrinker flag, implemented as AppConfig.saveLessFormData. This is an experimental mode in Tangy Form that only captures the properties of inputs that have changed from their original state in the form. This should lead to smaller formResponses and quicker sync data transfers. Commit: [35a05c2b](https://github.com/Tangerine-Community/Tangerine/commit/35a05c2b183b3df48e90073611d2631fac6eb8bd), Tangy-form pull: Add support for shrinking form responses [#209](https://github.com/Tangerine-Community/tangy-form/pull/209)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.21.0
./start.sh v3.21.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.20.4
```

## v3.20.4

__Fixes__

- Fixes resuming an unfinished Event Form. Commit [bf97492](https://github.com/Tangerine-Community/Tangerine/pull/3154/commits/bf9749247d4d0e8b7500bbd64433f6b5f9514426)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.20.4
./start.sh v3.20.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.20.3
```

## v3.20.3

__Fixes__

- Editing Timed Grids on Forms: Capture at item and Duration are compared as strings leading to unexpected validation scenarios [#3130](https://github.com/Tangerine-Community/Tangerine/issues/3130)
- Fix CORs usage in Tangerine APIs when outside applications are using credentials.  [#3132](https://github.com/Tangerine-Community/Tangerine/pull/3132)
- When Tangerine creates CouchDB users for Sync, DB Administration, and Reporting, restrict that users access to the databases for the group they are assigned. This is a tightening of security to support use cases where users of groups on the same server should be restricted from accessing other groups data on the same server when Sync Protocol 2 and Database Administrator features are being used. [#3118](https://github.com/Tangerine-Community/Tangerine/pull/3118)
- Data Manager views in CSV which cycle sequence was used in each form response [#3128](https://github.com/Tangerine-Community/Tangerine/pull/3128).
- Fix access denied message when using Tangerine APIs [#3133](https://github.com/Tangerine-Community/Tangerine/pull/3133)
- Make status translateable on Tangerine Teach Task Report. [#3089](https://github.com/Tangerine-Community/Tangerine/issues/3089)
- When editing Timed Grids on Forms, "Capture at Time" and "Duration" are compared as strings leading to unexpected validation scenarios. [#3130](https://github.com/Tangerine-Community/Tangerine/issues/3130)
- Fix database export when using Sync Protocol 1 by using the correct database names [#3120](https://github.com/Tangerine-Community/Tangerine/issues/3120)


__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.20.3
./start.sh v3.20.3
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.20.2
```


## v3.20.2

__Fixes__

- Improve listing of items in the Data menu. Issue: [#3125](https://github.com/Tangerine-Community/Tangerine/issues/3125)
- Fix issue where Group User on server with permission to access database would not have access. Commit: [a10162d9](https://github.com/Tangerine-Community/Tangerine/commit/a10162d92642cf83ae43aa3ad96033691e5b0a76)
- Add Amharic translation.
- Fix issue when backup has never run, the Clean backups command in Maintenance on client fails, and the process alert 
  does not go away. This PR also copies over a fix for clearing all progress messages from Editor. PR: [#3098](https://github.com/Tangerine-Community/Tangerine/pull/3098)
- Fix bad url for Print Content feature in Editor/Author. PR: [#3099](https://github.com/Tangerine-Community/Tangerine/pull/3099)
- Clicking on unavailable form in Case should not open it. Issue: [#3063](https://github.com/Tangerine-Community/Tangerine/issues/3063)
- The csv and mysql outputs must carry over the 'archived' property from the group db. PR: [#3104](https://github.com/Tangerine-Community/Tangerine/pull/3104)
- Bump tangy-form to v4.28.2 and tangy-form-editor to v7.9.5. Includes fix for tangy-input-groups change logic Issue: [#2728](https://github.com/Tangerine-Community/Tangerine/issues/2728)
- Users should enter dataset description when creating a dataset in Editor PR: [#3078](https://github.com/Tangerine-Community/Tangerine/pull/3078)
- Avoid crashes when properties on the markup are accessed before being available to the component [#3080](https://github.com/Tangerine-Community/Tangerine/pull/3080)
- Replace special chars with underscore in CSV output. PR: [#3003](https://github.com/Tangerine-Community/Tangerine/pull/3003/)
- Refresh global reference to T.case when using a case so most importantly the correct context is set PR: [#3108](https://github.com/Tangerine-Community/Tangerine/pull/3108)
- Link to download data set downloads a JSON file with headers and group config doc. Issue: [#3114](https://github.com/Tangerine-Community/Tangerine/issues/3114)
- CSV template creation fails. Issue: [#3115](https://github.com/Tangerine-Community/Tangerine/issues/3115)
- Restart couchdb container on failure. PR: [#3112](https://github.com/Tangerine-Community/Tangerine/pull/3112)
- APK and PWA Updates fail with User not logged in (every time) [#3111](https://github.com/Tangerine-Community/Tangerine/issues/3111)
- Fix error when looping through input values for data dictionary. PR: [#3124](https://github.com/Tangerine-Community/Tangerine/pull/3124)
- Add config to allow output of multiple participants in MySQL. Consult the PR for implementation details. If you wish to enable this feature, add `T_MYSQL_MULTI_PARTICIPANT_SCHEMA:true` to the config.sh script. PR: [#3110](https://github.com/Tangerine-Community/Tangerine/pull/3110/)

__Upgrade notice__

If your project was already using the Data Conflicts tools that were installed manually, you must remove those in order to 
prevent a conflict with the Database Conflicts tool that is now automatically installed in Tangerine -> Deploy -> Database 
Conflicts. Reset the group-uuid/editor directory with the content-sets/case-module/editor components or the content-sets/case-module-starter/editor/index.html file.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.20.2
./start.sh v3.20.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.20.1
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.20.1

__Fixes__

- Fix Form Editor removes manually added on-resubmit logic in tangy-form [#3017](https://github.com/Tangerine-Community/Tangerine/issues/3017)
- Support old PWAs that did not check for all permissions when installed in order to get permanent storage [#3084](https://github.com/Tangerine-Community/Tangerine/issues/3084)

__New Features__

- Add Maintenance page to client to enable app administration tasks (clear out old backups and fix permissions) and disk space statistics. [#3059](https://github.com/Tangerine-Community/Tangerine/pull/3059)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.20.1
./start.sh v3.20.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.20.0
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.20.0

__Fixes__

- Improve rendering of Device listing. PR: [#2924](https://github.com/Tangerine-Community/Tangerine/issues/2924) *Note* that you must run the update or else the Device view will fail.
- Converted print form view as a single table [#2927](https://github.com/Tangerine-Community/Tangerine/pull/2927)
- Improvements to restoring a database from a backup PR: [#2938](https://github.com/Tangerine-Community/Tangerine/pull/2938)
- On server group's security page, fix link to adding roles and show loading screen when saving role.
- Data outputs for CSV's now include the 'archived' property. [#2988](https://github.com/Tangerine-Community/Tangerine/pull/2988)
- This one goes out to the coders: Prevent CaseService singleton injection into Case related components [#2948](https://github.com/Tangerine-Community/Tangerine/pull/2948). This is an important change in how cases are handled - they are no longer singletons. 
  If you are developing scripts for a form and there are problems accessing T.case, see the comments in #2948 for a solution.

__New Features__

- New CSVs related to Cases now available for Case Participants, Case Events, and Case Event Forms. https://github.com/Tangerine-Community/Tangerine/pull/2908
- Online Survey user is warned if they are using an unsupported web browser (Internet Explorer). https://github.com/Tangerine-Community/Tangerine/pull/3001 
- Data Manager generates CSV with specific columns using CSV Templates.
- Data Manager restores Case Event stuck in Conflict Revision. Add the `can_restore_conflict_event` permission to the users' role(s) to enable. [#2949](https://github.com/Tangerine-Community/Tangerine/issues/2949)
- Enable Data Conflict Manager for groups. [2997](https://github.com/Tangerine-Community/Tangerine/pull/2997) This is based on the [couchdb-conflict-manager](https://github.com/ICTatRTI/couchdb-conflict-manager) web component.
- In Offline App, when submitting a form, opening a case, creating a case, etc., a new loading screen is shown. [#3000](https://github.com/Tangerine-Community/Tangerine/pull/3000)
- In Online Survey, new support for switching language without interrupting the survey. [#2643](https://github.com/Tangerine-Community/Tangerine/issues/2643)
- For PWA's, there is a new device permissions step in device setup to guarantee persistent storage [#3002](https://github.com/Tangerine-Community/Tangerine/pull/3002)
- The login screen may now have custom markup. [#2979](https://github.com/Tangerine-Community/Tangerine/pull/2979)
- Statistical files are now available in Stata .do format for corresponding forms [#2971](https://github.com/Tangerine-Community/Tangerine/pull/2971)
- The new `usePouchDbLastSequenceTracking` property in app-config.json and settings page enables the use of PouchDB's native last sequence tracking support when syncing. [#2999](https://github.com/Tangerine-Community/Tangerine/pull/2999)
- The new `encryptionPlugin:'CryptoPouch'` property in app-config.json enables testing of the CryptoPouch extension currently in development. [#2998](https://github.com/Tangerine-Community/Tangerine/pull/2998) Please note that this feature is not yet ready for deployment. There are now three different possible storage configurations for Tangerine:
  1. "encryptionPlugin":"CryptoPouch" - Configures the app to use CryptoPouch, which encrypts documents in the app's indexedb for storage.
  2. "turnOffAppLevelEncryption": true - Configures the app without encryption, using the app's indexedb for storage instead of sqlite/sqlCypher.
  3. "encryptionPlugin":"SqlCipher" - or without any additional configuration (SqlCipher is the default configuration.) - Configures the app to use SqlCipher, which encrypts documents in an external sqlLite database for storage.
- We have changed how we determine which storage engine is being used. In the past we exposed a window['turnOffAppLevelEncryption']
  global variable based on the same flag in app-config.json; however, now we are determining in app-init.ts which engine is running and exposing either `window['cryptoPouchRunning']` or `window['sqlCipherRunning']` to indicate which engine is running. It is important to note that even the app is configured with `encryptionPlugin:'CryptoPouch'` in app-config.json, the app may have been installed without that setting and is actually running sqlCypher. This is why it is important to observe if either `window['cryptoPouchRunning']` or `window['sqlCipherRunning']` is set. 

__Backports/Good to Know__

When we add new features or fix issues in patch releases of Tangerine, those code changes usually get added automatically to any new 
releases of Tangerine. To make sure users of new releases are aware of those changes, we will occasionally mention them in 
this section in case they have missed them in the Changelog for the corresponding earlier release. Please note that when you 
install or upgrade a new Tangerine release, please review the Changelog for any changes in minor or patch releases. 

- Server admin can configure regex-based password policy for Editor. Instructions in the PR: [#2858](https://github.com/Tangerine-Community/Tangerine/pull/2858) Issue: [#2844](https://github.com/Tangerine-Community/Tangerine/issues/2844)
- Show loading screen in more places that typically hang such as the Case loading screen, issue loading, issue commenting, and many other places when working with Issues on the sever. (demo: https://youtu.be/RkoUN41jqr4)
- Enhancements to support for archiving cases:
  - Added ability to search archived cases. Issue: [#2977](https://github.com/Tangerine-Community/Tangerine/issues/2977)
  *Important* : Run `docker exec -it tangerine /tangerine/server/src/upgrade/v3.19.3.js` to enable searching archived cases.
  - Added archive/unarchive Case functionality and permission for "can delete" [#2954](https://github.com/Tangerine-Community/Tangerine/pull/2954)
- Added backup and restore feature for Tangerine databases using device encryption. Increase the appConfig.json parameter `dbBackupSplitNumberFiles` (default: 200) to speed up the backup/restore process if your database is large. You may also change that parameter in the Export Backup user interface. Updated docs: [Restoring from a Backup](./docs/system-administrator/restore-from-backup.md) PR: [#2910](https://github.com/Tangerine-Community/Tangerine/pull/2910)
- Updates to tangy-form lib to 4.25.18 ([Changelog](https://github.com/Tangerine-Community/tangy-form/blob/master/CHANGELOG.md#v4280)), which provides:
  - Support for changing a page content's language and number system without reloading the page.
  - A fix for photo-capture so that it de-activates the camera when going to the next page or leaving a form. Also a new feature for configuring compression
  - Implemented a new 'before-submit' event to tangy-form in order to listen to events before the 'submit' event is dispatched.
  - A fix for User defined Cycle Sequences.
- *Important* If your site uses csvReplacementCharacters to support search and replace configuration for CSV output, which was released v3.18.2, you must change the configuration string. See issue [#2804](https://github.com/Tangerine-Community/Tangerine/issues/2804) for information about the new schema.
- Feature: Editor User downloads CSVs for multiple forms as a set Issue: [#2768](https://github.com/Tangerine-Community/Tangerine/issues/2768)  PR:[#2777](https://github.com/Tangerine-Community/Tangerine/pull/2777)
- Feature: Remove configurable characters from CSV output [#2787](https://github.com/Tangerine-Community/Tangerine/issues/2787).

__Server upgrade instructions__

Important upgrade: Please note that you must run update below (v3.20.0.js) to install the new listDevices view. If you don't the Devices listing will fail.

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.20.0
./start.sh v3.20.0
# Run the update to install the new listDevices view.
docker exec -it tangerine /tangerine/server/src/upgrade/v3.20.0.js
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.19.1
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.19.3

__Fixes__

- Fix issue where loading screen would not close after submitting a proposal on an Issue.
- Fixes from v3.18.8 incorporated.
- Fixes to how role based permission rules are applied on the schedule view. 
- Fix CaseService.rebaseIssue from failing due to accessing eventForms incorrectly.

__New Features__

- Show loading screen in more places that typically hang such as the Case loading screen, issue loading, issue commenting, and many other places when working with Issues on the sever. (demo: https://youtu.be/RkoUN41jqr4)
- Material design applied to loading indicator on the server. 
- New cancel button on loading indicator on the server. Will warn that this may cause data corruption and data loss. (demo: https://youtu.be/da9cxG5w8c0)
- Added ability to search archived cases. Issue: [#2977](https://github.com/Tangerine-Community/Tangerine/issues/2977)
  *Important* : Run `docker exec -it tangerine /tangerine/server/src/upgrade/v3.19.3.js` to enable searching archived cases.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.19.3
./start.sh v3.19.3
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.19.2
# Run the v3.19.3.js update to enable indexing of archived documents.
docker exec -it tangerine /tangerine/server/src/upgrade/v3.19.3.js
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.19.2

__Fixes__

- Added process indicator when archiving, un-archiving, or deleting a case. Issue: [#2974](https://github.com/Tangerine-Community/Tangerine/issues/2974)
- Add v3.19.2 update to recover if v3.19.0 search indexing failed

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.19.2
./start.sh v3.19.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.19.1
# Perform additional upgrades.
docker exec -it tangerine bash
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.19.1

__Fixes__

- Improved backup and restore file processing. Docs: [Restoring from a Backup](./docs/system-administrator/restore-from-backup.md) PR: [#2910](https://github.com/Tangerine-Community/Tangerine/pull/2910)
- Added archive/unarchive Case functionality and permission for "can delete" [#2954](https://github.com/Tangerine-Community/Tangerine/pull/2954)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.19.1
./start.sh v3.19.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.19.0
# Perform additional upgrades.
docker exec -it tangerine bash
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.19.0

__New Features__

1. __Data Manager requests and downloads CSVs for multiple forms as a set.__ When logged into the server and in a group, you will now find a "Download CSV Data Set" menu item under "Data". From there you can view all of the CSV Data Sets you have generated in the past, the status of wether or not they have finished generating, a link to download them, and other meta data. Click the "New Data Set" button and you will be able to select any number of forms to generate CSVs for, data for all time or a specific month, and wether or not to exclude PII. This is especially useful for generating CSVs that take longer to generate than the automatic logout built into the server. You may request a CSV Data Set, log out, and then log back in later to check in on the status and download it. A Server Administrator can also configure cron with a `generate-csv-data-set` command to generate a data set on a daily, weekly, or monthly basis, handy for situations where you want CSVs to automatically generate on the weekend and then download them on Monday. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2768) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2777)
2. __Data Manager archives a Case to remove it from reporting output and Devices.__ This adds an "archive" button on Cases that flags all related Form Responses as archived and removes them from CSV output and Search on Devices. This uses the new T.case.archive() API which adds an 'archived' flag for those docs and saves a minimal version of the doc with enough data to be indexed on the server. Search on client and server CSV output are modified to filter archived docs. When viewing cases in Editor, displays "Archived" when viewing an archived case. When client syncs, it deletes any docs with the 'archived' flag and sets deletedArchivedDocs In the replicationStatus log. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2843) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2776)
3. __Devices Manager reconfigures claimed Device sync settings and selects multiple Sync Locations for a Device.__ Details: To change a Device's sync settings currently requires a reinstall of the app on the Device and setting up all the accounts again. This PR will allow system admins to change the sync settings for a Device which then triggers on next sync a Rewind Push, database delete, then a first pull with the new sync settings. Subsequent syncs then use the new sync settings. This PR also refactors the Create and Edit forms for Devices on the server so that multiple sync locations can be added. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2867) (PR: [#2782](https://github.com/Tangerine-Community/Tangerine/pull/2782))
4. __Device Manager estimates how large an initial sync will be given selected sync settings.__ When setting up sync settings for a Device, it is useful to know how many documents will need to be downloaded given which forms are configured for syncing down and the locations assigned. There is now a "calculate down-sync size" button at the bottom of Device edit/creation forms that when pressed will tally up the documents needing to be down synced given the device sync settings. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2845) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2818)
5. __Devices Manager monitors for Devices close to filling up disk space.__ Devices now report how much free space they have to the server after a sync. This can be monitored on the `Deploy > Devices` list. When a Device reports having less than 1GB free storage, a warning is shown on the Devices list. (Ticket: [2779](https://github.com/Tangerine-Community/Tangerine/issues/2779)) (PR: [2795](https://github.com/Tangerine-Community/Tangerine/pull/2795))
6. __Server User views the version of Tangerine installed.__ Any user on the server can now view the version of Tangerine installed by going to Help menu in the left nav bar. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2846) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2794)
7. __Database Consumer accesses Tangerine MySQL databases via web browser.__ Users of Tangerine's MySQL database sometimes are not allowed to install tools such as MySQL Workbench on their work computers. This PR makes starting PHPmyAdmin (a mysql viewer) as a web service a configuration option in Tangerine so no one has to install software on their computer to access Tangerine MySQL. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2847) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2793)
8. __Data Collector creates Account on Device and associates with any User Profile in Group (ignoring Device assignment/sync settings).__  By default, when a Data Collector creates an Account on Device, they can only associate with User Profiles that are assigned to the same location as the Device's Assigned Location. Add `"disableDeviceUserFilteringByAssignment":true` to the app-config.json for the group and this restriction will be removed. Tablets will also sync all User Profiles, ignoring the Device's configured Sync Location(s). (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2848) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2792)
9. __Form Developer writes code that can access Case's related Location metadata without writing asynchronous code.__ When working synchronously in forms, we don't currently have access to the related Location Node data without loading the Location List async and using T.case.case.location to search the hierarchy for the node we want. This PR loads all related Location Nodes into memory at T.case.location when the context of a Case is set. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2849) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2791)
10. __Server Administrator configures substitutions for CSV output.__ This feature allows a Server Administrator to update the group's configuration in the app database to contains Regex string replacements for CSV output. This can be handy in situations where Data Analysts are having trouble parsing CSV data that contains line breaks and commas. An example configuration to remove line breaks and commas from data would be `"csvReplacementCharacters": [{"search": ",", "replace": "|"}, {"search": "\n", "replace": "___"}]`. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2787) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2788)
11. __Server Administrator configures Tangerine to not auto-commit in groups' data directories to preserver manually managed git content repositories.__ When using git to manage group content in a git flow like manner, the automatic commit can result in unnintentional commits. System Administrators can now turn off this auto-commit by configuring Tangerine's `config.sh` with `T_AUTO_COMMIT="false"`. If set to true also include the frequency `T_AUTO_COMMIT_FREQUENCY="60000"`  (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2614) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2748)
12. __Data Collector proposes change to a Form on a Case.__ The issues feature that has been available on the server is now optionally also available on Devices by `"allowCreationOfIssues": true` to `client/app-config.json` for the group you want this enabled. Most of the features of Issues you are familiar with from the server are there, except for merging proposals which is not allowed. Issues from Devices are uploaded to the server where proposals can be merged by a Data Manager. We also streamlined the Issue creation and proposal process by skipping the page to fill out an issue title/description, and then forward them directly to creating a proposal. To aid in issue titles/descriptions that make sense, Content Developers can now add `templateIssueTitle` and `templateIssueDescription` to Case Definition files.  (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2850) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2330) ([Demo Video](https://youtu.be/xWXKubQNLog))
13. __Data Manager updates Issue Title and Issue Description__ Data Managers will now find a metadata tab on an Issue where they can update the Title, Description, and new "Send to" settings. (Issue: https://github.com/Tangerine-Community/Tangerine/issues/2851) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2330)
14. __Data Manager sends an Issue to all Devices in Sync Area or specific Device__ When create/configuring an Issue, Data Managers now have the option to send an Issue to a specific location in a Sync Area, or send it to a specific Device by Device ID. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2854) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2330)
15. __Forms Developer defines custom logic for Device's search of Cases and Forms__ In some cases there are situations where the standard variables for searching do not cover all things we want searched, or there is a compound field we want to be searched. Adding a client/custom-search.js file allows the Forms Developer to hook into the map function used to generate the search index. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2852) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2740)
16. __Data Manager views list of Issues related to Case__ When viewing a Case on the server, the first screen when opened will now show a list of related Issues. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2723) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2573)
17. __Form Developer uses API to override Device User based access to Event Forms on a per Case Event basis__ Currently we can configure in a Case Definition the operation permissions on all instances of an Event Form. This change allows a Form Developer to write logic that would control those permissions on a per Event Form basis by setting the same `permissions` property on the Event Form itself. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2624) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2660)
18. __Form Developer configures Devices to skip optimization of database views not in use on Device.__ Some projects relying heavily on a custom app will find they do not use all of the standard Tangerine database views, thus they can be skipped during the data optimization phase after a sync. In `app-config.json`, you can add a new `doNotOptimize` property with a value as an array of views to skip. To discover what views your app is indexing, see the console logs from a device during the optimization phase. You may discover some views you can add to `doNotOptimize` to speed up that optmization process. (Commit: https://github.com/Tangerine-Community/Tangerine/commit/4b8864470c1cad98e43152dd6bb3c91ee3e576a6)
19. __System Administrator batch imports all forms from a Tangerine v2 group into a Tangerine v3 group__ Tangerine v3 now has a script that will import all v2 group forms into a v3 group without having to do each form individually. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2857) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2584)

__Fixes__

1. __Issue created programatically in on-submit says we must rebase but no button to rebase #2785__ Cases that have used the `T.case.createIssue()` API in forms to create Issues on the current form have recently found the resulting issues are broken. This is due to a change in when the Form Response is associated with the case (later than when T.case.createIssue() is called in a form's on-submit). To remedy this, we've added a new `T.case.queueIssueForCreation("Some label", "Some comment")` API. __If you are using T.case.createIssue(), immediately upgrade and replace its usage with T.case.queueIssueForCreation()__. (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2785) (Example: https://github.com/Tangerine-Community/Tangerine/blob/next/content-sets/case-module/client/test-issues-created-programatically-on-client/form.html#L5)
2. __Using a simpler reverse sort for device status__ (PR: https://github.com/Tangerine-Community/Tangerine/pull/2775)
3. __Increase likelihood that migration of data to mysql will recover where it left off if server restarts.__ (PR: https://github.com/Tangerine-Community/Tangerine/pull/2773)
4. __From Case Definitions, the `onCaseOpen` and `onCaseClose` now also run in the server context.__ (PR: https://github.com/Tangerine-Community/Tangerine/pull/2696)
5. __"openEvent is not defined" when accessing a case in Editor__ (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2800)
6. __Synclog date/time header is incorrect and sort is broken__ (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2762)
7. __Synchronization UX Improvements - remove error state after retries when retry is successful__ (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2808) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2826)
8. __Fix missing 'form_' from id for v2 import__ (Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2856) (PR: https://github.com/Tangerine-Community/Tangerine/pull/2726)
9. __Minor tweak to tangerine-preview README__ (PR: https://github.com/Tangerine-Community/Tangerine/pull/2735)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.19.0
./start.sh v3.19.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.18.3
# Perform additional upgrades.
docker exec -it tangerine bash
push-all-groups-views
update-down-sync-doc-count-by-location-id-index '*'
# This will index all database views in all groups. It may take many hours if 
# the project has a lot of data.
wedge pre-warm-views --target $T_COUCHDB_ENDPOINT
```

## v3.18.10

__Fixes__

- Backport: Make status translateable on Tangerine Teach Task Report. [#3089](https://github.com/Tangerine-Community/Tangerine/issues/3089)
- Backport: When editing Timed Grids on Forms, "Capture at Time" and "Duration" are compared as strings leading to unexpected validation scenarios. [#3130](https://github.com/Tangerine-Community/Tangerine/issues/3130)


## v3.18.9

__Fixes__

- Backport: Restrict access to events by permissions when query by date on schedule view.
- Fix issue where logging in as a different user shows the previously logged in users data (Multiuser/Tablet sharing https://github.com/Tangerine-Community/Tangerine/issues/2060)
- Add additional translateables to Tangerine Teach components (Translatable feedback status text: https://github.com/Tangerine-Community/Tangerine/issues/2693) (Missing translatable strings: https://github.com/Tangerine-Community/Tangerine/issues/2987)
- Allow class title to be anywhere on form [#2994](https://github.com/Tangerine-Community/Tangerine/pull/2994)

## v3.18.8
- Add support for skipping indexes in form's cycle sequences.
- Fix radio button scoring in Teach by only adding the final value of max to the totalMax variable. https://github.com/Tangerine-Community/Tangerine/issues/2947
- On Tangerine Teach reports, fix calculating of "percentile", AKA percent correct grouping. https://github.com/Tangerine-Community/Tangerine/issues/2941

## v3.18.7

__Fixes__

- Back-ported some fixes to the backup and restore feature from the v3.19.1 branch.
- Fixed issue with Teach where third subtask would not open correctly.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.18.7
./start.sh v3.18.7
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.18.6
```


## v3.18.6

__Updates__

- Updated tangy-form lib from 4.25.11 to 4.25.14 ([Changelog](https://github.com/Tangerine-Community/tangy-form/blob/master/CHANGELOG.md#v42514)), which provides:
  - A fix for photo-capture so that it de-activates the camera when going to the next page or leaving a form. 
  - Implemented a new 'before-submit' event to tangy-form in order to listen to events before the 'submit' event is dispatched.
  - A fix for User defined Cycle Sequences.

__Fixes__

- Remove incorrect exception classes for changes processing #2883 PR: [#2883](https://github.com/Tangerine-Community/Tangerine/pull/2883) Issue: [#2882](https://github.com/Tangerine-Community/Tangerine/issues/2882)
- Added backup and restore feature for Tangerine databases using device encryption. Increase the appConfig.json parameter `dbBackupSplitNumberFiles` (default: 200) to speed up the backup/restore process if your database is large. You may also change that parameter in the Export Backup user interface. Updated docs: [Restoring from a Backup](./docs/system-administrator/restore-from-backup.md) PR: [#2910](https://github.com/Tangerine-Community/Tangerine/pull/2910)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.18.6
./start.sh v3.18.6
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.18.5
```

## v3.18.5

__Fixes__

- Server admin can configure regex-based password policy for Editor. Instructions in the PR: [#2858](https://github.com/Tangerine-Community/Tangerine/pull/2858) Issue: [#2844](https://github.com/Tangerine-Community/Tangerine/issues/2844)

## v3.18.4

__Fixes__

- Backported a fix from the v3.19.0 branch for "Save the lastSequence number after each change is processed in the tangerine-mysql connector" Issue [#2772](https://github.com/Tangerine-Community/Tangerine/issues/2772)
- Address crashes when importing data using the mysql module [#2820](https://github.com/Tangerine-Community/Tangerine/issues/2820)

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
# Fetch the updates.
git fetch origin
git checkout v3.18.4
./start.sh v3.18.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.18.3
```

## v3.18.3

__Fixes__

- *Important* If your site uses csvReplacementCharacters to support search and replace configuration for CSV output, which was released v3.18.2, you must change the configuration string. See issue [#2804](https://github.com/Tangerine-Community/Tangerine/issues/2804) for information about the new schema.
- Backported a fix from the v3.19.0 branch for "Issue created programmatically in on-submit says we must rebase but no button to rebase #2785"
  - Description: Cases that have used the `T.case.createIssue()` API in forms to create Issues on the current form have recently found the resulting issues are broken. This is due to a change in when the Form Response is associated with the case (later than when T.case.createIssue() is called in a form's on-submit). To remedy this, we've added a new `T.case.queueIssueForCreation("Some label", "Some comment")` API. __If you are using T.case.createIssue(), immediately upgrade and replace its usage with T.case.queueIssueForCreation()__.
  - Ticket: https://github.com/Tangerine-Community/Tangerine/issues/2785
  - Example: https://github.com/Tangerine-Community/Tangerine/blob/next/content-sets/case-module/client/test-issues-created-programatically-on-client/form.html#L5

## v3.18.2
- Feature: Editor User downloads CSVs for multiple forms as a set Issue: [#2768](https://github.com/Tangerine-Community/Tangerine/issues/2768)  PR:[#2777](https://github.com/Tangerine-Community/Tangerine/pull/2777)
- Feature: Remove configurable characters from CSV output [#2787](https://github.com/Tangerine-Community/Tangerine/issues/2787).
- Documentation updates for backup/restore and fixes to image paths
- Fix default user profile so it doesn't assume use of roles or location
- Disabled "Print form backup" in Editor
- Improvements to display of "Print metadata" in Editor
- Update and fix for Cycle Sequences to enable numbering of sequences starting from 1. PR's: [#231](https://github.com/Tangerine-Community/tangy-form-editor/pull/231), [#269](https://github.com/Tangerine-Community/tangy-form/pull/269)
- Bump tangy-form to 4.25.11 and tangy-form-editor to 7.8.8.

## v3.18.1
- Fix backup when using os encryption and sync protocol 2 and cordova. (PR: [#2767](https://github.com/Tangerine-Community/Tangerine/pull/2767))
- Fix creating of new Device Users when using Sync Protocol 2. (PR: [#2769](https://github.com/Tangerine-Community/Tangerine/pull/2769))
- Fix default user profile form for Sync Protocol 1 users. We should not assume they are using roles or location.

## v3.18.0

### New Features
- Enable configurable image capture in client [#2695](https://github.com/Tangerine-Community/Tangerine/issues/2695) 
  - Makes image capture work with a max size attribute - PR: [#218](https://github.com/Tangerine-Community/tangy-form/pull/218)
  - Add photo capture widget [#203](https://github.com/Tangerine-Community/tangy-form-editor/pull/203)
- Serve base64 image data as image files [#2706](https://github.com/Tangerine-Community/Tangerine/issues/2706) PR: [#2725](https://github.com/Tangerine-Community/Tangerine/pull/2725)
- Add Cycle sequences [1603](https://github.com/Tangerine-Community/Tangerine/issues/1603)
- Sort by lastModified in the client case search [#2692](https://github.com/Tangerine-Community/Tangerine/pull/2692)
- Enable assigning multiple roles in forCaseRole in the eventFormDefinition [#2694](https://github.com/Tangerine-Community/Tangerine/pull/2694/)
- Enable defining custom functions or valid JavaScript expressions that will be called when an event is opened and when an event is closed. On open and close events for case and case-events: [#2696](https://github.com/Tangerine-Community/Tangerine/pull/2696/files)
- Teach-specific strings in Russian for default content-set [#2676](https://github.com/Tangerine-Community/Tangerine/pull/2676)
- Uploads status such as app version when updating the app [#2756](https://github.com/Tangerine-Community/Tangerine/issues/2756)

### Bugfixes
- Initialize `git` in content repository before running `git` commands [#2667](https://github.com/Tangerine-Community/Tangerine/pull/2667)
- Only show the links to historical releases when T_ARCHIVE_PWAS_TO_DISK and T_ARCHIVE_APKS_TO_DISK in the config.sh are set to true [#2608](https://github.com/Tangerine-Community/Tangerine/issues/2608)
- Fix form breaking when form name has single quote [#2489](https://github.com/Tangerine-Community/Tangerine/issues/2489)
- Add print options to archived forms [#1987](https://github.com/Tangerine-Community/Tangerine/issues/1987)
- Fix Grid having negative values [#2294](https://github.com/Tangerine-Community/Tangerine/issues/2294)
- Fix to allow for running on m1 Macs #2631 [#2631](https://github.com/Tangerine-Community/Tangerine/pull/2631) Thanks @fmoko and @evansdianga!
- For projects using the Case Reporting screen but don't have anything in reports.js but do have markup in reports.html, avoid crash due to empty file [#2657](https://github.com/Tangerine-Community/Tangerine/issues/2657)
- V2 import script fixes [#2675](https://github.com/Tangerine-Community/Tangerine/pull/2675)
- Allow HTML markup in option labels [2453](https://github.com/Tangerine-Community/Tangerine/issues/2453)
- Reset grid values when grid is restarted [#](https://github.com/Tangerine-Community/Tangerine/issues/2559)
- Mark last attempted automatically when grid is auto-stopped [#2467](https://github.com/Tangerine-Community/Tangerine/issues/2467)

### New Documentation
- [Deleting Records](./docs/developer/deletion-strategy.md)
- [Bullet points for Tangerine Development](./docs/developer/development-bullet-points.md)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.


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
# Fetch the updates.
git fetch origin
git checkout v3.18.0
./start.sh v3.18.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.11
```

## v3.17.12

- Feature: Remove configurable characters from CSV output [#2787](https://github.com/Tangerine-Community/Tangerine/issues/2787).

This release also has bugfixes specific to the Class module, which now uses updated API's for form rendering. 

- Feature for Class/Teach: Archive or enable a class. Issue: [#2580](https://github.com/Tangerine-Community/Tangerine/issues/2580)
- Bugfix for Class/Teach: Teach loses data and blocks app if Class form is not submited [#2783](https://github.com/Tangerine-Community/Tangerine/issues/2783)
- Bugfix for Class/Teach: App should return user to previous Curriculum when resuming app. Issue: [#2648](https://github.com/Tangerine-Community/Tangerine/issues/2648)
- Refactor Class to handle changes in tangy-form; Bug in CSV rendering for Tangerine Teach. Issue: [#2635](https://github.com/Tangerine-Community/Tangerine/issues/2635)

## v3.17.11
- Added support for custom update scripts for each group. Add either a before-custom-updates.js or after-custom-updates.js to the root of your content depending on when you wish the script to run. Script needs to return a Promise. See Issue [2741](https://github.com/Tangerine-Community/Tangerine/issues/2741) for script example. PR: [#2742](https://github.com/Tangerine-Community/Tangerine/pull/2742)
- Add support for filtering PII variables on Case Participant data and Event Form data in Synapse caches. List the variable names in your group's content folder `reporting-config.json`. For example: `{ "pii": ["foo_variable"] }`. This config was previously stored in the groups database.
- Fixed bug that prevented rewind sync from working.
  
  __Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.11
./start.sh v3.17.11
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.10
```

## v3.17.10
- Skip optimizing sync-queue, sync-conflicts, and tangy-form views after Sync Protocol 2 sync completes.
- Using `T.case.load()` in a form? This release fixes a bug where EventForm.formResponseId would be not set when submitting forms in cases where a form has loaded a different case and then the save case back again thus detaching the memory reference being previously set.
- Remove trailing whitespace from variables for mysql outputs to avoid illegal column names.
- Add response-variable-value API with support for returning jpeg and png base64 values as files.
- Refactor TANGY-SIGNATURE and TANGY-PHOTO-CAPTURE output in CSVs to be URLs of the image files.
- Creates work-around for deployments that are unable to use custom-scripts. [Issue #2711](https://github.com/Tangerine-Community/Tangerine/issues/2711) [PR #2712](https://github.com/Tangerine-Community/Tangerine/pull/2712) 

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.10
./start.sh v3.17.10
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.9
```

## v3.17.9

### New Features and Buffixes
- Prevent failed calls to `T.case.save()` in forms by avoiding any saves to a case when a form is active. [PR](https://github.com/Tangerine-Community/Tangerine/pull/2704/), [Issue](https://github.com/Tangerine-Community/Tangerine/issues/2700)
- Enable assigning multiple roles in forCaseRole in the eventDefinition [#2694](https://github.com/Tangerine-Community/Tangerine/pull/2694/) - Cherry-picked commit [3e4938a0a80c57](https://github.com/Tangerine-Community/Tangerine/pull/2694/commits/3e4938a0a80c57c66aa8f4b0eda32b84c85ebe99) only.
- Enable defining custom functions or valid JavaScript expressions that will be called when an event is opened and when an event is closed. On open and close events for case and case-events: [#2702](https://github.com/Tangerine-Community/Tangerine/pull/2702)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.9
./start.sh v3.17.9
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.8
```

## v3.17.8
- Fix use of initial batch size [#2685](https://github.com/Tangerine-Community/Tangerine/pull/2685)
- Created `generate-form-json` script that generates the form json for a group from its form.html file. Usage:
  `docker exec tangerine generate-form-json group-uuid`
  The script loops through a group's forms.json and creates a form.json file in each form directory, next to its forms.html.
  Before using this script, run `npm install`. Issue: [#2686](https://github.com/Tangerine-Community/Tangerine/issues/2686)
- The synapse module now uses the json from `generate-form-json` to exclude PII. Also, the synapse module takes substitution and pii fields to accommodate schema changes and pii fields not identified in forms. PR: [#2697](https://github.com/Tangerine-Community/Tangerine/pull/2697/) 
  
   Place these properties in the groups Couchdb:
  
```json

  "substitutions": {
    "mnh_screening_and_enrollment_v2": "mnh01_screening_and_enrollment"
  },
  "pii": [
    "firstname",
    "middlename",
    "surname",
    "mother_dob"
  ]
  

```
  
__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.8
./start.sh v3.17.8
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.7
```


## v3.17.7
- fix CSV generation issue: [#2681](https://github.com/Tangerine-Community/Tangerine/issues/2681)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.7
./start.sh v3.17.7
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.6
```


## v3.17.6
- fix issue w/ empty replicationStatus?.userAgent
- Switched from just-snake-case to @queso/snake-case - better Typescript compatability.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.6
./start.sh v3.17.6
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.5
```

## v3.17.5
- Bumps tangy-form to 4.23.3, editor to 4.23.3. Issue: [2620](https://github.com/Tangerine-Community/Tangerine/issues/2620)
- Update date carousel to 5.2.1 with fix for clicking the today button. PR: [#2677](https://github.com/Tangerine-Community/Tangerine/pull/2677)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.5
./start.sh v3.17.5
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.4
```

## v3.17.4
- Enables support for reducing the number of documents processed in the changed feed when syncing using the 'changes_batch_size' property in app-config.json. This new setting will help sites that experience crashes when syncing or indexing documents. Using this setting *will* slow sync times. Default is 50. During recent tests, the following settings have been successful in syncing a location with over 12,700 docs that was experiencing crashes:
  - "batchSize": 50
  - "writeBatchSize": 50
  - "changes_batch_size": 20
  
  Please do note that these particular settings do make sync very slow - especially for initial device sync. 
- Removed selector from push sync - was causing a crash on large databases. Using a filter instead in the push syncOptions 
  to exclude '_design' docs from being pushed from the client.
- Adds "Encryption Level" column to the Devices Listing, which shows if the device is running 'OS' encryption or 'in-app' encryption.
  - 'OS' encryption: Encryption provided by the device operating system; typically this is File-based (Android 10) or Full-disk encryption (Android 5 - 9).
  - 'in-app' encryption: Database is encrypted by Tangerine.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.4
./start.sh v3.17.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.3
```

## v3.17.3
- Automatically retry after failed sync. (https://github.com/Tangerine-Community/Tangerine/pull/2663)
- Do not associate form response with Event Form if only opened and no data entered.
- Fix issue causing Android Tablets using OS level encryption to spontaneously start using in-app encryption.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.3
./start.sh v3.17.3
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.2
```

## v3.17.2
- Add support for depending on Android Disk encryption as opposed to App Level encryption. Set `turnOffAppLevelEncryption` to `true` in `client/app-config.json`. Note that enabling this will not turn off App Level encryption for devices already installed, only new installations.
- Fix race condition data conflict on EventFormComponent that is triggered when opening and submitting a form quickly. Prevent data entry until Case is loaded to avoid conflicting Case save of a fast submit. 
- Fix bug causing Device ID to not show up on About page on Devices.
- When syncing, push before pull to avoid having to analyze changes pulled down for push.
- Fix download links for archived APKs on Live channel.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.17.2
./start.sh v3.17.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.1
```

## v3.17.1
- Add support for Form Versions when it hasn't been used before by defaulting the first entry in formVersions when a form version isn't defined on a Form Response.
- Fix issue causing Device Admin user log in to fail.
- Restore missing `sectionDisable` function in skip logic for forms.

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders.
docker start couchdb
docker start tangerine
# Fetch the updates.
git fetch origin
git checkout v3.17.1
./start.sh v3.17.1
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.17.0
```

## v3.17.0

__New Features and Fixes__

- Device User Role access to Case Events and Event Forms [#2598](https://github.com/Tangerine-Community/Tangerine/pull/2598)
  - [Getting started with using Device User Roles](https://youtu.be/ntL-i8MVpew)
  - [Demo: Device User role based access to Event Forms](https://youtu.be/T0GfYHw6t6k)
  - [Demo: Device user role based permissions for Case Events](https://www.youtube.com/watch?v=5okk6XrrfaA&feature=youtu.be)
- Deactivate Case Participant API [#2594](https://github.com/Tangerine-Community/Tangerine/pull/2594)
  - [Demo: https://youtu.be/Ulh-yCqfbFA](https://youtu.be/Ulh-yCqfbFA)
- Data Collector with a single click opens all pages of a completed form response [#2596](https://github.com/Tangerine-Community/Tangerine/issues/2596)
- `skip()` and `unskip()` functions are now available in `tangy-form` level `on-change` logic for skipping and unskipping sections, not inputs.
- Fix print form as table for some forms. (https://github.com/Tangerine-Community/Tangerine/pull/2568)
- Update the group icon on server [#2355](https://github.com/Tangerine-Community/Tangerine/pull/2355)
- Add window.uuid() API [#2595](https://github.com/Tangerine-Community/Tangerine/pull/2595)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders.
docker start couchdb
docker start tangerine
# Fetch the updates.
git fetch origin
git checkout v3.17.0
./start.sh v3.17.0
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.4
```

## v3.16.5

__Fixes__

- T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK setting have no effect. Issue: [#2608](https://github.com/Tangerine-Community/Tangerine/issues/2608)
- Bug in CSV rendering for Tangerine Teach. Issue: [#2635](https://github.com/Tangerine-Community/Tangerine/issues/2635) new setting outputDisabledFieldsToCSV in groups doc

__Developer Interest__

There is now a content set for developing projects with the Class module enabled in content-sets/teach. Sets the following properties in app-config.json:

- "homeUrl": "dashboard"
- "uploadUnlockedFormReponses": true

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders. 
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.5
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.5
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.4
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`
```  

## v3.16.4

__New Features__

- Warning about data sync: Any site that upgraded to v3.16.2 is at risk of having records stay on the tablet unless they upgrade to v3.16.3 or v3.16.4. After upgrading to v3.16.4, go to the Online Sync feature and click the new 'Advanced Options' panel. There are two new options for sync - Comparison Sync and Rewind Sync. Comparison sync enables the Sync feature to compare all document id's on the local device with the server and uploads any missing documents. Rewind Sync resets the sync "placeholder" to the beginning, ensuring that all docs are synced. It doesn't actually re-upload all docs; it instead checks that all docs have been uploaded.  It is more thorough than Comparison Sync. Both of the features are for special cases and should not be used routinely. Issue: [#2623](https://github.com/Tangerine-Community/Tangerine/issues/2623)

  There are two settings that can be configured for Comparison sync:
   - compareLimit (default: 150) - Document id's must be collected from both the tablet and server in order to calculate what documents need to be sync'd to the server. This setting limits the number of docs queried in each batch. 
   - batchSize (default: 200) - Number of docs per batch when pushing documents to the server. This same configuration setting is used for normal sync, so please take care when making changes to it.
  
  This new "Comparison" option is very new and may have rough edges. In our experience, if the app crashes while using it, re-open the app and try again; chances are that it will work. If it consistently fails, lower the value for app-config.json's compareLimit property. 

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders.
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.4
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.3
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.3
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`

```

## v3.16.3

__New Features__

- Warning about data sync: Any site that upgraded to v3.16.2 is at risk of having records stay on the tablet unless they upgrade to v3.16.3. After upgrading to v3.16.3, run the new "Push all docs to the server" feature available from the Admin Configuration menu item. This feature resets push sync to the beginning, ensuring that all docs are pushed. It doesn't actually re-upload all docs; it instead checks that all docs have been uploaded.

- Added "Push all docs to the server" feature to the Admin Configuration menu item.
- Added Operating System and Browser Version to Device listing.

__Fixes__
- Data collected after first registering and after updates fails to upload. Issue: [#2623](https://github.com/Tangerine-Community/Tangerine/issues/2623)

__Server upgrade instructions__

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders. 
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.3
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.3
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.2
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`
```  

## v3.16.2

__New Features__

- Enables filtering of Case Event Schedule by Device's Assigned Location PR: [#2591](https://github.com/Tangerine-Community/Tangerine/pull/2591)

__Fixes__
- Enables editing of device description. Commit: [#2613](https://github.com/Tangerine-Community/Tangerine/issues/2613)

__Server upgrade instructions__

If you want to enable filtered Case Event Schedule by Device's Assigned Location, add `filterCaseEventScheduleByDeviceAssignedLocation` to your groups' `app-config.json` set to a value of `true`.

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders. 
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.2
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.2
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.1
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`
```  

## v3.16.1

__New Features__

- Improves sync stats and add "Export Device List" feature PR: [#2610](https://github.com/Tangerine-Community/Tangerine/pull/2610)

__Fixes__
- Fixes Editor form creation issue [#2605](https://github.com/Tangerine-Community/Tangerine/issues/2605) and form copy issue [#2604](https://github.com/Tangerine-Community/Tangerine/issues/2604)
- Adds check for calculateLocalDocsForLocation before running update to index an index it depends upon.
- Update tangy-form to 4.21.3, tangy-form-editor to 7.6.5 to fix dynamically set level tangy location not resuming correctly [#202](https://github.com/Tangerine-Community/tangy-form/pull/202)


__Server upgrade instructions__
Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Ensure git is initialized in all group folders. 
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.1
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.1
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.16.0
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`
```

## v3.16.0

__New Features__

- Warning about data sync: If you have implementations that have multiple tablets syncing from the same location, some docs may not be on all tablets due to issues with earlier versions of sync. This release resolves that particular issue and provides ways to ensure that all tablets share the same data. We have implemented several ways to rectify and understand potential data inconsistencies across tablets in the field:
  - After updating the server to 3.16.0 *and* after updating and syncing the clients, the Device dashboard will now display the number of docs on each tablet ("All Docs on Tablet") and the number of docs according to the device's Location configuration ("Form Responses on Tablet for Location"). 
    - Depending on the Configure/Sync settings, the "All Docs on Tablet" count may be close, but not exactly the same, since not all forms may be synced to the tablets.
    - The "Form Responses on Tablet for Location" count should be the same for all tablets that share the same location configuration. Please note that "Form Responses on Tablet for Location" count needs to be activated by adding `"calculateLocalDocsForLocation": true` to app-config.json; also note that it has not been widely tested and may be unstable. (If you activate this feature, you may also add `"findSelectorLimit"` to modify how many batches are used to calculate this value. Default is 200. Lower is safer but slower.) 
      
    These data points may help in identifying data  inconsistencies. Remember - only after updating *and syncing* the tablets, will these new doc counts be populated with data in the Devices listing. Making a note of the document counts per tablet will help establish a baseline.
  - Next step would be to run the new "Force Full Sync" feature, which is implemented in two ways: 
    - If you add the new `"forceFullSync" : true` setting in the group's app-config.json, the client will perform a full sync upon the next update. Since this takes time and Internet bandwidth, you may wish to notify users before enabling this feature.
    - When logging in as "admin" user on the client tablet, a new menu item called "Admin Configuration" will be visible below the "Settings" item. This new item enables manual operation of the "Force Full Sync" feature. It is labeled "Pull all docs from the server" in the user interface.
  - You may adjust the settings for how many documents "Force Full Sync" downloads at a time by adjusting the `initialBatchSize` property in app-config.json. The default is 1000 documents per batch. This setting is also used when performing the initial load of documents on a tablet.
- Tangerine Release Archives: Every Tangerine APK or PWA release is saved and tagged. If your site is configured for archives (which is the default), you may download previous Android releases. PR: [#2567](https://github.com/Tangerine-Community/Tangerine/pull/2567)
- A "Description" field has been added to the Devices listing to faciliate identification of devices or groups of devices.   
- *Beta Release* Mysql module: Data sync'd to Tangerine can be output to a MySQL database. Warning: This should not yet be deployed on a production server; the code for this feature is still in development. We recommend creating a separate server for the Tangerine/MySQL installation and replicate data from the production server to the Tangerine server that would provide the MySQL service.
  Docs: `docs/system-administrator/mysql-module.md` PR: [#2531](https://github.com/Tangerine-Community/Tangerine/pull/2531)
- Devices listing offers more information about the sync process, including version, errors, and sync duration.

__Fixes__
- Changes to the sync code should improve sync stability and speed. [#2592](https://github.com/Tangerine-Community/Tangerine/issues/2592) You may configure certain sync properties:
  - initialBatchSize = (default: 1000) Number of documents downloaded in the first sync when setting up a device.
  - batchSize (default: 200) - Number of documents downloaded upon each subsequent sync.
  - writeBatchSize = (default: 50) - Number of documents written to the tablet during each sync batch.
- Updated tangy-form-editor to v7.6.4, which improves functionality of `duplicate entire section`. PR: [#173](https://github.com/Tangerine-Community/tangy-form-editor/pull/173)
- Updates the Schedule View to use date-carousel 5.2.0 which provides unix timestamps instead of date strings. [#2589](https://github.com/Tangerine-Community/Tangerine/pull/2589)
- Upgrade tangy-form to fix issue causing `on-open` of first items to not run when proposing changes in an Issue.
- Deactivate App.checkStorageUsage if using Sync Protocol 2. This was not compatible and should not run.
- Allow projects to disable GPS warming to save on battery with `disableGpsWarming` in `app-config.json`.
- Add missing import of `editor/custom-scripts.js` when using editor so Data Dashboards can have imported JS files.

__Server upgrade instructions__
Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.


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
# Ensure git is initialized in all group folders. 
docker start couchdb
docker start tangerine
docker exec tangerine sh -c "cd /tangerine/groups && ls -q | xargs -i sh -c 'cd {} && git init && cd ..'"
# Fetch the updates.
git fetch origin
git checkout v3.16.0
# If you are enabling the new mysql module, follow the instructions in `docs/system-administrator/mysql-module.md` to update the config.sh file (steps 1 through 3)
# If you do not wish APK and PWA archives to be saved, set T_ARCHIVE_APKS_TO_DISK and/or T_ARCHIVE_PWAS_TO_DISK to false.
# Then return here before starting tangerine
# Now you are ready to start the server.
./start.sh v3.16.0
docker exec tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.6
# If setting up mysql return to step 5 in `docs/system-administrator/mysql-module.md`
```  

## v3.15.8
- New Sync code reduces the number of network requests by disabling server checkpoints. It also supports three new app-config.json options to configure sync parameters that adjust data download size, how much data is written to the local database each batch, and initial data download:
  - batchSize: Number of docs to pull from the server per batch. Increasing this setting will decrease the number of network requests to the server when doing a sync pull. Default: 200
  - writeBatchSize: How many docs to write to the database at a time. If the database crashes, decreasing this option could be helpful. Default: 50
  - useCachedDbDumps: Enables caching of the group database to a file for a single download to the client upon initial device setup. This is an experimental feature therefore it is not enabled by default. (Some server code is also currently disabled.) Those files are stored at data/groups/groupName/client/dbDumpFiles. At this point, you must delete the dbDumpFiles if you wish to update the data in the initial device load. [2560](https://github.com/Tangerine-Community/Tangerine/issues/2560)
- Disable the v3.15.0 update from groups that use sync-protocol 1. 
- Added `2021` to the report year.
- Added simple network statistics to the device replicationStatus, which is posted after every sync.

__Server upgrade instructions__
Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.15.8
# Now you are ready to start the server.
./start.sh v3.15.8
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.7
```

## v3.15.7
__New Features and Fixes__
- Fixes a bug in the CSV generation code that caused sections of rows in the CSV to output improperly. PR:[#2558](https://github.com/Tangerine-Community/Tangerine/pull/2558)
- Adds a server config that allows the user to control the string used for variables that are `undefined`: `T_REPORTING_MARK_UNDEFINED_WITH="UNDEFINED"`
- The default value of the new config file is set to "ORIGINAL_VALUE" so existing Tangerine instances will not be effected.

__Server upgrade instructions__
Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

Please add the below line into your config.sh to preserve current behavior (as a workaround for #2564)
```
T_REPORTING_MARK_UNDEFINED_WITH=""
```

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
# Fetch the updates.
git fetch origin
git checkout v3.15.7
# Now you are ready to start the server.
./start.sh v3.15.7
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.6
```

## v3.15.6

__New Features and Fixes__
- New 'wakelock' feature for sync: When using the sync feature, the screen should not go to sleep or dim, enabling the sync process to proceed. This is especially useful during long sync processes. When you navigate to another page once Sync is complete, the wakeLock feature is disabled. 
- The Devices listing has a new option, "View Sync Log", which enables viewing status of the most recent replication, when available.  
- Added error messages when internet access drops during a sync. [#2540](https://github.com/Tangerine-Community/Tangerine/issues/2540)
- Batch size for sync is configurable via `pullSyncOptions` and `pushSyncOptions` variable in a group's app-config.json. Default is 200. If the value is set too high, the application will crash.

__Server upgrade instructions__
Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.15.6
# Now you are ready to start the server.
./start.sh v3.15.6
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.5
```  

## v3.15.5

__Fixes__
- In CSV output, if a section on a form is opened and then the later skipped, inputs on that skipped section will appear in CSV output as skipped. However, if the section is never opened, the inputs would show up in the CSV as blank values. This fix ensures that these remaining inputs are marked as skipped in CSV output.
- Fix sync from breaking when syncing with a group with no data yet.
- Improve messaging during sync by removing floating change counts and showing the total number of docs in the database after sync.

__Server upgrade instructions__
Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

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
# Fetch the updates.
git fetch origin
git checkout v3.15.5
# Now you are ready to start the server.
./start.sh v3.15.5
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.4
```  


## v3.15.4

__Fixes__
- Sync: Sites with large datasets were crashing; therefore, we implemented a new sync function that syncs batches of documents to the server. PR: [#2532](https://github.com/Tangerine-Community/Tangerine/pull/2532)

__Server upgrade instructions__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.15.4
# Now you are ready to start the server.
./start.sh v3.15.4
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.3
```

## v3.15.3
__Fixes__
- After a large sync in sync protocol 2, improve overall app performance by indexing database queries. Because this may cause a long sync for projects not using this, you can set `indexViewsOnlyOnFirstSync` in `app-config.json` to `true` if you want to allow existing tables to avoid this long sync to catch up on views.
- Add missing `custom-scripts.js` and `custom-styles.css` files to Editor app. We also add `editor` and `client` ID's to the body tag of the two app respectively.
- Reduce database merge conflicts by preventing form responses from saving after completed. Prior to this version, on two tablets (or on a tablet and the server) if you opened the same form response and opened an item to inspect, it would cause a save on both tablets resulting in an unnesessary merge conflict.
- New `T.case.getCaseHistory(caseId)` function for getting the history of save for a Case. Returns an array of JSON patches in RFC6902 format.  Open a Case and run `await T.case.getCaseHistory()` in the console and it will pick up on the context.
- New `T.case.getEventFormHistory(caseId, caseEventId, eventFormId)` function for getting the history of save for a form response in a Case. Returns an array of JSON patches in RFC6902 format.  Open a Case, a Case Event, then an Event Form and run `await T.case.getEventFormHistory()` in the console and it will pick up on the context.
- New opt-in `app-config.json` setting `attachHistoryToDocs` for enabling upload all history of Case and Event Form edits on a Tablet up to the Server. Without this setting on, the server only sees the history starting from time of upload. Note this has an impact on upload size of at least doubling it when turned on.

__Important configuration notice__
- Set `indexViewsOnlyOnFirstSync` in `app-config.json` to `true` if you want to allow existing tables to avoid this long sync to catch up on views.

__Server upgrade instructions__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.15.3
# Now you are ready to start the server.
./start.sh v3.15.3
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.2
```

## v3.15.2

__Fixes__

- Rshiny module: Replaces hard-coded underscore separator with the configurable `sep` variable. 
- Error when processing CSV's: [2517](https://github.com/Tangerine-Community/Tangerine/issues/2517)

__Important configuration notice__

The v3.15.0 release included an update to the Editor Search feature [#2416](https://github.com/Tangerine-Community/Tangerine/issues/2416) that requires adding a `searchSettings` property to forms.json. In addition to running the upgrade script for v3.15.0; you must also make sure that *all* forms in a group's forms.json have `searchSettings` configured, especially the `shouldIndex` property. Examples are in the [Case Module README](./docs/editor/case-module/README.md#configuring-text-search) "Configuring Text Search" section.

__Server upgrade instructions__

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
# Fetch the updates.
git fetch origin
git checkout v3.15.2
# Now you are ready to start the server.
./start.sh v3.15.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.1
```  

## v3.15.1

__Fixes__

- Prevent opening of Event Forms on Editor when there is no corresponding Form Response available. 
- Fix Issue type detection when deciding what is going to be in the 'current' tab. 
- Update CSV output for signatures to be 'signature captured' and ''.
- Fix Issues view causing Issue search result to appear once per event such as comment or proposal. 
- Integrate fixes in v3.14.6 including `T.case.isIssueContext()` API, and better API partity between being in an Event Form in a Case and being in an Event Form in an Issue.

__Server upgrade instructions__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.15.1
# Now you are ready to start the server.
./start.sh v3.15.1
docker exec -it tangerine push-all-groups-views  
docker exec -it tangerine reporting-cache-clear  
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.15.0
```  

## v3.15.0

- __New Features and fixes__
  - Editor User searches Cases by keyword [#2416](https://github.com/Tangerine-Community/Tangerine/issues/2416) - This feature enables searching by any of the variables assigned in searchSettings/variablesToIndex in forms.json. 
  - Transfer Participant between Cases [#2419](https://github.com/Tangerine-Community/Tangerine/issues/2419). Find Participant UI: [#2439](https://github.com/Tangerine-Community/Tangerine/pull/2439).
  - Update to [Content Set 2.1](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.15.0/docs/editor/content-sets.md) adds a package.json and build step to pin lib versions and add a build step for custom-scripts.
  - Added error message to Updates error alert. [ccc1864
](https://github.com/Tangerine-Community/Tangerine/commit/ccc186425bcdce0d596da34781ca36a3cf6dfbc2)
  - New "Release Online Survey" menu on Server allows you to release a single form for data collection online. Note the original "Deploy -> Release" menu item has been moved to "Deploy -> Release Offline App".
  - Fixed issue where "Tangy Gate" form element could be added in Editor but would not appear on Tablets.
  - Support for new "<tangy-ethio-date>" element that brings a Partial Date style form element with support for the Ethiopian Calendar.
  - If using Sync Protocol 2, the first sync when registering a Device is now faster in cases where there is a lot of data already collected. Also the blank User Profile created for the Admin user on a device is no longer uploaded resulting in less noise in the Device Users list.


- __Important deprecation notice__
  - The groupName property, once used in app-config.json, is no longer supported in recent releases of Tangerine. The groupId property is used in its place. Groups that use groupName will not be able to sync; they must migrate to groupId. This issue affects groups using sync-protocol-1. [#2447](https://github.com/Tangerine-Community/Tangerine/issues/2447)
   - When form responses are unlocked in a Data Issue, the `on-submit` hook no longer runs. If you need logic to run, use the new `on-resubmit` hook.
   - If using Sync Protocol 2, the "Auto Merge" feature that tries to fix database conflicts is now off by default and database conflicts will not be logged as Issues. If you would like to keep it on, set `"autoMergeConflicts": true` in your group's `client/app-config.json` file. However be aware that turning this on will result in inconsistent results (https://github.com/Tangerine-Community/Tangerine/issues/2484). Monitoring for database conflicts can now be done by monitoring the `syncConflicts` view via CouchDB Fauxton.
   
__Server upgrade instructions:__
```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.15.0
# Now you are ready to start the server.
./start.sh v3.15.0
# Update the views - there are new views for Searches and Participant Transfers.
docker exec -it tangerine reporting-cache-clear 
docker exec -it tangerine /tangerine/server/src/upgrade/v3.15.0.js
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.14.6
```  

## v3.14.6
Changes in v3.14.4 were abandoned, changes in v3.14.5 have been rolled into v3.15.0. The following are changes for v3.14.6.

- Improve first sync performance: On first sync, skip push but set the last push variable to whatever we left on after the first pull.
- Improve in-form API parity between context of a Case and context of an Issue proposal. Sets case context in more scenarious inside of Issue Form proposals.
- Prevent form crashes and unintentional logic by adding the new `T.case.isIssueContext()` API for detecting if in the Issue context in a form.
  
__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.14.6
# Now you are ready to start the server.
./start.sh v3.14.6
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.14.3
```

## v3.14.3
- __Bugfix__
  - Auto-merged conflicts overwrite "canonical" change made on Editor server [#2441](https://github.com/Tangerine-Community/Tangerine/issues/2441) - Prevents tablets from overwriting documents from Editor in special cases. After modifying the case record, add canonicalTimestamp to the document: `"canonicalTimestamp":1603854576785`
- __New Features and fixes for all Tangerine__
  - Reduce number of unnecessary saves in Editor [#2444](https://github.com/Tangerine-Community/Tangerine/issues/2444)
  - Improvements to Issues Listing [#2398](https://github.com/Tangerine-Community/Tangerine/issues/2398) Please update the group views (noted in the Server upgrade instructions below) in order to use the Issues Listing.
- __Upgrades in the Developers' Interest__
  - Removed webpack from the Docker image. Custom apps should build their apps using their own webpack; the APK service will no longer perform that task. 
  
__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.14.3
# Now you are ready to start the server.
./start.sh v3.14.3
# Update the views - there is a new view used for Issues.
docker exec -it tangerine push-all-groups-views
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.14.2
```
  
## v3.14.2
- __Bugfix__
  - Fixes file path issue when bundling custom scripts in APK's.

__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.14.2
# Now you are ready to start the server.
./start.sh v3.14.2
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.14.1
```

## v3.14.1
This is identical to v3.14.0 but was released to fix a problem with tangerine-preview v3.14.0 on npm.

## v3.14.0
- __New Features and fixes for all Tangerine__
  - __Usability Improvement for Device Registration__: Added "Number of devices to generate" field to Device Registration. Submitting a single form to add multiple devices to a group should simplify large deployments. [#2402](https://github.com/Tangerine-Community/Tangerine/issues/2402)
  - __Important bugfix for sync issue in poor network situations__: If you currently have an active 3.13 deployment, run the 3.14 update on client to make sure all data is sync'd to the server. [#2399](https://github.com/Tangerine-Community/Tangerine/issues/2399)
  - __Automatic conflict resolution on client__: Basic support for automatic merges of conflicts in EventForms. [#2272](https://github.com/Tangerine-Community/Tangerine/pull/2272) Documentation for [testing conflicts](https://github.com/Tangerine-Community/Tangerine/blob/master/docs/developer/testing-conflicts.md)
  - __Form version support__: Enables use of previous form versions for form display. [#2365](https://github.com/Tangerine-Community/Tangerine/issues/2365) Support for versioning is not yet implemented in the Editor; however, there is documentation on [how to implement form versions](https://github.com/Tangerine-Community/Tangerine/blob/master/docs/editor/form-versions.md) manually.
  - __User Interface updates__: The 4.19.0 tangy-form lib version features the following fixes:
    - Required Field Asterisk (*) does not align with the question text [#2363](https://github.com/Tangerine-Community/Tangerine/issues/2363)
    - Error Text and Warning Text have the same style - this is confusing for users [#2364](https://github.com/Tangerine-Community/Tangerine/issues/2364)
  - __Setting packageName in app-config.json causes app to crash__: The docker-tangerine-base-image update to 3.7.0 improves Android and Cordova lib dependencies, and the release-apk code now rebuilds the Android code whenever an APK is built. [#2366](https://github.com/Tangerine-Community/Tangerine/issues/2366)
  - __New module for rshiny development__: Adds option to csv module to change delimiter from '.' to '_'[#2314](https://github.com/Tangerine-Community/Tangerine/issues/2314)
  - __Documentation Update__:   Re-organization of some documentation and addition of missing image files. [#2401](https://github.com/Tangerine-Community/Tangerine/issues/2401)
- __Upgrades in the Developers' Interest__
  - __Upgraded docker-tangerine-base-image to v3.7.1__: Upgrade to Android API_LEVEL 30, Cordova 10, node:14.12.0-stretch. [#1890](https://github.com/Tangerine-Community/Tangerine/issues/1890) Caching cordova-android platform to avoid network issues when customizing packageName. [#7](https://github.com/Tangerine-Community/docker-tangerine-base-image/issues/7)
- __Important note for users of tangerine-preview__
There was a problem with v3.14.0 on npm; therefore, please use tangerine-preview v3.14.1.

## v3.13.1
- Fix: Issues on Editor always ask us to rebase [#2376](https://github.com/Tangerine-Community/Tangerine/issues/2376)
- Fix: Issues screen will not load after upgrading from v3.10.0 to v3.13.0 [#2378](https://github.com/Tangerine-Community/Tangerine/issues/2378)
- Fix: Issues go missing after upgrading to v3.13.0 from v3.12.x [#2377](https://github.com/Tangerine-Community/Tangerine/issues/2377)
* Please be aware: this release was made in the release/v3.13.1-alt branch and to date has only been built as the v3.13.1-rc-2 image.

__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.13.1
# Now you are ready to start the server.
./start.sh v3.13.1
# Run upgrade
docker exec -it tangerine /tangerine/server/src/upgrade/v3.13.1.js
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.13.0
```

## v3.13.0
- __New Features and fixes for all Tangerine__
  - __Download Location List as CSV__: You can now download a location list as a CSV. If you prefer editing a Location List via something like Excel, this makes editing an existing location list easier, which can then be imported when done editing in Excel. *Note:* Advise careful use of this export feature until [#2336](https://github.com/Tangerine-Community/Tangerine/issues/2336) is fixed. [#2107](https://github.com/Tangerine-Community/Tangerine/issues/2107)
  - __Duplicate a Section__:When editing a form, you can now easily duplicate an entire section with the "duplicate section" button. [#2109](https://github.com/Tangerine-Community/Tangerine/issues/2109). Warning - this feature does not handle complex objects such as tangy checkbox groups well; be sure to check the code it generates. This issue will be addressed in the next 3.13 point release.
  - __Group Data Dashboard in Editor__: "Dashboard" is now a menu item available in a Group under the Data menu. This link can be enabled by group role (disabled by default). When on the Dashboard page, it displays a customizable dashboard for that specific group. Customizing Dashboards currently requires HTML and Javascript knowledge but in the future we may build a configurator for Dashboards.
  - __More Menu Permissions in Editor__:Add additional Editor permissions to completely cover menu level access in a group
  - __Automatic conflict resolution__: After a sync pull on client, detects type of conflict and resolves it. View status of merges in the Issues feature. [#1763](https://github.com/Tangerine-Community/Tangerine/issues/1763)
  - __Fix extending session in Editor__ - When prompted to extend session shows up session is not really extended. [#2266](https://github.com/Tangerine-Community/Tangerine/issues/2266)
- __New Features and Fixes for Case Module__
  - __Client "Issues" feature__: "Issues" previously could only be viewed using Editor. With this release, Issues can now be accessed from Client in a Case module enabled Group via the top level "Issues" tab. This tab can be disabled adding or modifying `"showIssues": false,` to app-config.json. Note that only issues created targeting the "CLIENT" context (See CaseService API documentation) will show up in the Client "Issues" tab.
  - __Easier searching on Client__: Previously on Client when searching for "Facility 8" you would need to type exactly "Facility 8". Now search is case insensitive and you may type "facility 8" to match against "Facility 8".
  - __T.case.setEventWindow API fix__: Previously when setting an Event window, the end time for the window was mistakenly ignored and set to the start time. This is now fixed. [#2304](https://github.com/Tangerine-Community/Tangerine/issues/2304)
- __New Features for Sync Protocol 2 Module__
  - __Export device sheets__: When registering Devices, we now offer an option to print "Device Sheets". Device Sheets include the registration codes for a Device and also some human readable metadata. Each row can also be used as a label for each device that can be fastened to a device using affordable clear packing tape. [#2269](https://github.com/Tangerine-Community/Tangerine/issues/2269)
  - __Restore Backup on Android Tablet__: Backups can now be restored. Restore is an option when first opening a freshly installed APK. [#2127](https://github.com/Tangerine-Community/Tangerine/issues/2127)
  - __Better support for working on the same Case on two devices__: When working offline on the same Case on two Devices, after a sync, it may seem like the changes on one Tablet have gone missing for some time until the "database conflicts" are resolved using the CouchDB Futon interface on the server. Starting in v3.13.0 we'll start to employ algorithms for automatically merging to speed up the process of resolving these database conflicts.
- __Notes for System Administrators__
  - After upgrade, you will no longer find group content directories in `./data/client/content/groups/`, they will be in `./data/groups/`. Inside each group's directory you will also find they have been split into a `client` and `editor` directory. All previous content will now be in the `client` directory while you may place content for the Group's Data Dashboard in the `editor` folder.
 
__Server upgrade instructions:__

This update changes the path to group content to `/tangerine/groups/${groupId}/client`. If your group is managing content 
via a Github/cron integration, you will need to change the path to content in its cron job. Change `GROUP-UUID` to your 
group id in the following command:

```
cd /home/ubuntu/tangerine/data/groups/GROUP-UUID/client && GIT_SSH_COMMAND='ssh -i /root/.ssh/arc-forms-dev' git pull origin master && git add . && git commit -m 'auto-commit' && GIT_SSH_COMMAND='ssh -i /root/.ssh/arc-forms-dev' git push origin master
```

The update:

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.13.0
# Now you are ready to start the server.
./start.sh v3.13.0
# Run upgrade
docker exec -it tangerine /tangerine/server/src/upgrade/v3.13.0.js
# Add or modify `"showIssues": false,` to the group's app-config.json if you do not want to display the Issues tab in client.
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.12.0
```


## v3.12.5
- Fixed issue with black screen when moving from p2p tab to home
  
## v3.12.4
- Fixed issue with QR code boundary boxes in tangy-form [#158](https://github.com/Tangerine-Community/tangy-form/issues/158).  Bumped tangy-form v4.17.10 and tangy-form-editor to 7.2.5

## v3.12.3
- Fixed issue with mutually exclusive checkboxes in tangy-form [#154](https://github.com/Tangerine-Community/tangy-form/issues/154).  Bumped tangy-form v4.17.9 and tangy-form-editor to 7.2.3

## v3.12.2
- When saving edits to a form, "Show if" logic has been written as `tangy-if` logic in the HTML. Form now on it will be written as `show-if` logic for consistency.
- `tangy-if` logic in has in the past in just showing/hiding an question on a form. It will now also reset the value if there is input and it is then hidden.
- In v3.12.0, `caseService.getCurrentCaseEventId()` was incorrectly removed. It has been added back, and an additional `caseService.getCurrentEventFormId()` function has been added for consistency.
- Fix Android 10 compatibility issue with P2P Sync mechanism causing tablets to crash.

## v3.12.1
- Change behavior of `show-if` logic so that when a question hides, the value is reset.
- Adjust behavior of how Event Forms are added: If `EventForm.autoPopulate` is left undefined and required is true, then the form should be added.

## v3.12.0
- New Features for Case Module
  - Data Collector finds Event Forms are automatically created on Case Event creation and after adding a Participant [#2147](https://github.com/Tangerine-Community/Tangerine/issues/2147) [[Demo](https://youtu.be/cNZhLNEKq0A)]
  - Data Collector has found a non required form has become required [#2233](https://github.com/Tangerine-Community/Tangerine/issues/2233)
    - Demo Part 1: https://youtu.be/dnJk4LaGuQw
    - Demo Part 2: https://youtu.be/I0JOZounZc4
  - Data Collector finds Case Event is automatically marked as complete [#2235](https://github.com/Tangerine-Community/Tangerine/issues/2235) [[Demo](https://youtu.be/AsWox69W9vY)]
  - Data Collector sees indicator on Event Form when corresponding Form Response has not been synced to a device [#2232](https://github.com/Tangerine-Community/Tangerine/issues/2232) [[Demo](https://youtu.be/0nEHvO6Wdy0)]
  - Data Collector views a dedicated page for a Participant's Event Forms for a specific Case Event [#2236](https://github.com/Tangerine-Community/Tangerine/issues/2236) [[Demo](https://youtu.be/0qrpnRM43gg)]
  - Data Collector is redirected to custom route after Event Form is submitted [#2237](https://github.com/Tangerine-Community/Tangerine/issues/2237) [[Demo](https://youtu.be/AoowqmZzMOM)]
- Fixes for Case Module
  - Device User registering only sees user profiles they can associate with restricted by location the Device is assigned [#2248](https://github.com/Tangerine-Community/Tangerine/issues/2248)
  - When all optional and incomplete forms are removed (no required forms in the event) from an event on the client the + button is not shown to re-add any of them [#2113](https://github.com/Tangerine-Community/Tangerine/issues/2113)
  - Delete an incomplete form from a case does not refresh the screen [#2114](https://github.com/Tangerine-Community/Tangerine/issues/2114)
- Fixes for all of Tangerine
  - Autostop is not triggered when marking the entire lineas incorrect [#1869](https://github.com/Tangerine-Community/Tangerine/issues/1869)
  - Mark entire line of grid as incorrect cannot be undone [#1651](https://github.com/Tangerine-Community/Tangerine/issues/1651)
  - Meta data print screen Prompt and Hint are not displayed for Radio Buttons (single type) [#1748](https://github.com/Tangerine-Community/Tangerine/issues/1748)
  - Form Metadata view of Checkboxes with one option is missing [#2239](https://github.com/Tangerine-Community/Tangerine/issues/2239)
- New features for Sync Protocol 2
  - Restore encrypted backup on Device [#2127](https://github.com/Tangerine-Community/Tangerine/issues/2127)

- API Changes for Case Module
  - `caseEvent.status` is now `caseEvent.complete` which has a value of `true` or `false` as opposed to the status strings.
  - `caseService.startEventForm(...)` is now `caseService.createEventForm(...)`.
  - `caseService.deleteEventFormInstance(...)` is now `caseService.deleteEventForm(...)`.
  - `caseService.getCaseEventFormsData(...)` is now `caseService.getEventFormData(...)`.
  - `caseService.setCaseEventFormsData(...)` is now `caseService.setEventFormData(...)`.

  
__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.12.0
# Now you are ready to start the server.
./start.sh v3.12.0
# Run upgrade
docker exec -it tangerine reporting-cache-clear 
# Remove Tangerine's previous version Docker Image.
docker rmi tangerine/tangerine:v3.11.0
```
Note that after running the upgrade script, your reporting caches may take some time to finish rebuilding.

__Android upgrade instructions:__
If you are upgrading an Android device that was installed with Tangerine v3.8.0 or greater, you will need to regenerate your APK and reinstall, otherwise you may use the over the air updater.

## v3.11.0
- New Features in all Tangerine
  - Device Manager installs many Tangerine APKs on a single device [#2182](https://github.com/Tangerine-Community/Tangerine/issues/2182)
  - CSV output enhancements:
    - Editor User indicates whether to include PII in CSV export [#1771](https://github.com/Tangerine-Community/Tangerine/issues/1771)
    - User profile information available in CSV export [#2081](https://github.com/Tangerine-Community/Tangerine/issues/2081)
    - Editor User exports CSV file that contains the group and form name [#2108](https://github.com/Tangerine-Community/Tangerine/issues/2108)
  - New 'T' namespace for helper functions [#2198](https://github.com/Tangerine-Community/Tangerine/issues/2198)
- New Features in Tangerine with Case Module enabled
  - Data Collector changes location of Case [#2098](https://github.com/Tangerine-Community/Tangerine/issues/20980) [[demo](https://youtu.be/kqf63PGudwc)]
  - Data Collector views an alert [#2020](https://github.com/Tangerine-Community/Tangerine/issues/2020) [[demo](https://youtu.be/iw1emB9Ddis)]
  - Data Collector views custom report [#2143](https://github.com/Tangerine-Community/Tangerine/issues/2143) [docs](https://docs.tangerinecentral.org/editor/case-module/custom-case-reports.md)
- Developer notes
  - Group permissions [#2187](https://github.com/Tangerine-Community/Tangerine/pull/2187)

__Server upgrade instructions:__

```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.11.0
# Now you are ready to start the server.
./start.sh v3.11.0
# Run upgrade
docker exec -it tangerine /tangerine/server/src/upgrade/v3.11.0.js
```
Note that after running the upgrade script, your reporting caches may take some time to finish rebuilding.

__Android upgrade instructions:__
If your groups are using Sync Protocol 2 module, an APK reinstall is required. Release the APK and reinstall on all Android Devices. If your groups are not using Sync Protocol 2, you may upgrade Android tablets over the air using the usual release process.


## v3.10.0
- New Features in all Tangerine
  - Editor User updates own profile and/or password [#2166](https://github.com/Tangerine-Community/Tangerine/issues/2166) [[demo](https://github.com/Tangerine-Community/Tangerine/issues/2166#issue-630070570)]
  - Editor User with appropriate permission manages site level permissions of users and edits details and password of user [#2155](https://github.com/Tangerine-Community/Tangerine/issues/2155) [[demo](https://youtu.be/Nz8Cu--Ek1E)]
  - Editor User views question configuration by category (as opposed to long list) [#2097](https://github.com/Tangerine-Community/Tangerine/issues/2097) [[demo](https://github.com/Tangerine-Community/Tangerine/issues/2097#issue-611877603)]
  - Server Admin creates group on command line with local or remote content set [#2174](https://github.com/Tangerine-Community/Tangerine/issues/2174)
    - [Demo: Server Admin creates group on command line from local or remote content set](https://youtu.be/dGo4C90aAto)
    - [Demo: Server Admin creates group on command line from content set in a private repository on Github](https://youtu.be/OhyCse2jT4M)
- New Features in Tangerine with Case Module enabled
  - Tangerine User views form response in alternative templates [#2176](https://github.com/Tangerine-Community/Tangerine/issues/2176) [[demo](https://youtu.be/f9gGjXDeiuw)]
  - Data Manager manages Data Issues [#1982](https://github.com/Tangerine-Community/Tangerine/issues/1982) [[demo](https://youtu.be/vJRd_MIE2yo)]
  - Data Manager rebases proposed changes in Issue [#2179](https://github.com/Tangerine-Community/Tangerine/issues/2179) [[demo](https://youtu.be/hChZgxOko2k)]
  - Data Manager creates Data Issue [#2144](https://github.com/Tangerine-Community/Tangerine/issues/2144) [[demo](https://youtu.be/1yQBI5iPYS0)]
  - Data Collector causes Issue to be created due to use of API in the form [#2145](https://github.com/Tangerine-Community/Tangerine/issues/2145) [[demo](https://youtu.be/sgGRS110qq4)]
  - Data Collector causes Issue to be created due to `discrepancy-if` logic in form [#2171](https://github.com/Tangerine-Community/Tangerine/issues/2171) [[demo](https://youtu.be/GSQfP-6HBiY)]
  - Synapse consumes structured outputs based on Case ER Diagram [#2051](https://github.com/Tangerine-Community/Tangerine/issues/2051)
- New features in Tangerine with Sync Protocol 2 Enabled
  - Improve two-way sync efficiency in PouchDB by using `doc_ids` filter as opposed to mango query [#2040](https://github.com/Tangerine-Community/Tangerine/issues/2040)
- Developer notes
  - Resolve problems with client compilation in Angular [#2091](https://github.com/Tangerine-Community/Tangerine/issues/2091)

__Upgrade instructions:__
```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.10.0
# Now you are ready to start the server.
./start.sh v3.10.0
# Run upgrade
docker exec -it tangerine /tangerine/server/src/upgrade/v3.10.0.js
```

## v3.9.1
- Fixes
  - Database views are missing when running `tangerine-preview` or `npm start` [#2096](https://github.com/Tangerine-Community/Tangerine/issues/2096)
  - Event Schedule day view duplicates day event and show it in previous day as well [#2103](https://github.com/Tangerine-Community/Tangerine/issues/2103)
  - According to date carousel, events appear off by one week [#2094](https://github.com/Tangerine-Community/Tangerine/issues/2094)
  - Event Schedule templates are failing [#2085](https://github.com/Tangerine-Community/Tangerine/issues/2085)
  - Reports form is not added to forms.json [#2088](https://github.com/Tangerine-Community/Tangerine/issues/2088)
  - Events appear off by one day in Schedule List [#2101](https://github.com/Tangerine-Community/Tangerine/issues/2101)
  - CouchDB port should be configurable in config.sh [#2092](https://github.com/Tangerine-Community/Tangerine/issues/2092)
  - When opening the schedule view the first page is missing the header dates [#2082](https://github.com/Tangerine-Community/Tangerine/issues/2082)
  - Data Collector unable to open an Event from the Event Schedule [#2102](https://github.com/Tangerine-Community/Tangerine/issues/2102)
  - When editing a radio button options in editor, options should be in one column, not two [#2090](https://github.com/Tangerine-Community/Tangerine/issues/2090)

## v3.9.0
- Features
  - Set and get properties for Case Event Forms [#2023](https://github.com/Tangerine-Community/Tangerine/issues/2023)
  - Data Manager reviews Cases [PR](https://github.com/Tangerine-Community/Tangerine/pull/2011)
  - Data Collector removes Event Form. [PR](https://github.com/Tangerine-Community/Tangerine/pull/2026)
- Fixes
  - Fix additional memory leaks in Case module causing tablets to slow down. [PR](https://github.com/Tangerine-Community/Tangerine/pull/2025)
  - Make `getValue()` function in Event Form List Item related templates less likely to crash. [change](https://github.com/Tangerine-Community/Tangerine/pull/2018/files#diff-c26fa38f2c0963295bb906bd95baf8b0L50)
  - Fixed incompatibilities with 2-way sync and P2P Sync. 
  - Fixed issue causing tablets to crash when syncing with a database with tens of thousands of records.
- Developer notes
  - Editor and Clients upgraded to Angular 8.
- Changes
  - Due to current limitations of two way sync, two changes have been made to the Device form in Tangerine Editor. First, changing a Device's assigned location and sync settings after the Device record has been claimed will no longer be allowed. Second, devices will now always be required to be assigned to the last level in your location hierarchy.

__Upgrade instructions:__

When you run the upgrade script, if you are using sync protocol 2 and have enabled, forms configured for 2 way sync will now be configured to use CouchDB sync to push documents up as opposed to "custom sync". 
```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.9.0
# If you did not upgrade your config.sh in v3.8.1, migrate it now.
# Move custom variables from config.sh_backup to config.sh. Note that T_ADMIN and T_PASS are no longer needed. 
mv config.sh config.sh_backup
cp config.defaults.sh config.sh
# To edit both files in vim you would run...
vim -O config.sh config.sh_backup
# Now you are ready to start the server.
./start.sh v3.9.0
# Run upgrade
docker exec -it tangerine /tangerine/server/src/upgrade/v3.9.0.js
```

## v3.8.1
- Client app performance improvements
  - Improved caching of files. We are caching important configuration files for faster page loads (app-config.json, forms.json, location-list.json) and the Roboto font and have reduced redundant rendering calls. [1991](https://github.com/Tangerine-Community/Tangerine/pull/1991)
  - Loading spinner when opening an Event Form in a Case. [#1992](https://github.com/Tangerine-Community/Tangerine/pull/1992)
  - Fixed a memory leak when viewing a Case which was causing tablets to crash if spending too much time on a Case screen. [#2000](https://github.com/Tangerine-Community/Tangerine/issues/2000)
  - Radiobuttons now load faster on forms.
- Editor fixes
  - Fixed an issue causing editor content region to be untouchable when window was narrow. [#1940](https://github.com/Tangerine-Community/Tangerine/issues/1940)
  - Improved CSV output so it now contains Release ID, Device ID, and Build Channel on every row [#349](https://github.com/Tangerine-Community/Tangerine/issues/349)
- Developer notes
  - We focused on issues with slow performance on tablets when viewing forms. We are caching important configuration files (app-config.json, forms.json, location-list.json) and the Roboto font and have reduced redundant rendering calls. More information in the [Globals doc](./docs/developer/tangerine-globals.md).  
- Server Admin notes
  - We cleaned up config variables in `config.sh`, deprecated `T_ADMIN` and `T_PASS` [#1986](https://github.com/Tangerine-Community/Tangerine/pull/1986)
  - New `generate-cases` command for load testing a large number of Cases based on your custom content in a group. [#1993](https://github.com/Tangerine-Community/Tangerine/pull/1993) 
  - New `reset-all-devices` command for reseting the server token and database keys for all devices. Note that after running this command you will need to reinstall on all devices and reregister with new QR codes. This command is useful if you are migrating a large amount of devices to a new group or a new server and you want to maintain Device ID consistency with the Device Serial numbers you are tracking.

__Upgrade instructions:__
```
# Fetch the updates.
cd tangerine
git fetch origin
git checkout v3.8.1
# Now migrate custom variables from config.sh_backup to config.sh. Note that T_ADMIN and T_PASS are no longer needed. 
mv config.sh config.sh_backup
cp config.defaults.sh config.sh
# To edit both files in vim you would run...
vim -O config.sh config.sh_backup
# Now you are ready to start the server.
./start.sh v3.8.1
```
## v3.8.0
v3.8.0 is a big and exciting release! To accomodate the long list of changes, we split up this round of release notes into sections: General, Sync Protocol 2 Module, and Case Module, and Developer notes.

### General 
The following are features and fixes that are coming to all Tangerine installs. With this release comes an improved Editor UI experience, a faster device setup process, new form features, and much more.

| Group tabs are now in 4 sections          | Breadcrumbs allows you to navigate back up deeply nested areas   |
| ----------------------------------------- | --------------------------------------------- |
| ![group page](screenshots/group-page.png) | ![form editing](screenshots/form-editing.png) |

- Editor User browses Group UI by nested categories (as opposed to flat list) [#1880](https://github.com/Tangerine-Community/Tangerine/issues/1880)
- Device Administrator is prompted to authorize permissions on first app load [#1896](https://github.com/Tangerine-Community/Tangerine/issues/1896)
- Data Collector defines password according to policy [#1867](https://github.com/Tangerine-Community/Tangerine/issues/1867)
- Data Collector views device info such as Device ID, Assigned Location, Server URL, Group Name, and Release Channel. [#1834](https://github.com/Tangerine-Community/Tangerine/issues/1834)
- Data Collector in checkboxes chooses "none of the above", then other options are unselected [#1822](https://github.com/Tangerine-Community/Tangerine/issues/1822)
- Editor distinguishes between inputs that are hidden and skipped [#1800](https://github.com/Tangerine-Community/Tangerine/issues/1800)
- Minor tweaks to the menu (now there is a single "Sync" item) and added tab bars to some pages for consistency.

### Sync Protocol 2 Module
Sync Protocol 2 is a new module that can be enabled on a Tangerine installation that adds Device management, the ability for form responses to sync to the server and back down to tablets, the ablity for two tablets to sync form responses with each other offline, and much more.

| Manage which devices have access to sync, when they last synced, when they last updated and which version | Define which form responses are synced up and back down to tablets   |
| ------------------------------------------------------- | ----------------------------------------------- |
| ![device management](screenshots/device-management.png) | ![sync settings](screenshots/sync-settings.png) |
    

- Data Collector generates encrypted backup of Device [#1909](https://github.com/Tangerine-Community/Tangerine/issues/1909)
- Data Collector conducts a two-way sync with server only getting data from server relevant to their location [#1755](https://github.com/Tangerine-Community/Tangerine/issues/1755)
  - Device sync by Location: Sync Protocol 2: Enables a "Device Setup" process on first boot of the client application. This requires you set up a "Device" record on the server. When setting up a Device record on the server, it will give you a QR code to use to scan from the tablet in order to receive it's device ID and token.
- Data Collector syncs to server with large dataset [#1757](https://github.com/Tangerine-Community/Tangerine/issues/1755)
- Data collector synchronizes data between devices using an Offline P2P mechanism [#279](https://github.com/Tangerine-Community/Tangerine/issues/279)
- Editor User configures two-way sync for form responses from specific forms [#1753](https://github.com/Tangerine-Community/Tangerine/issues/1753)
- Editor revokes access to syncing with server for a lost Device [#1894](https://github.com/Tangerine-Community/Tangerine/issues/1894)

### Case Module
- Data Collector views Case Events in Schedule with Estimated Day, Scheduled Day, Window, and Occurred On Dates [#1737](https://github.com/Tangerine-Community/Tangerine/issues/1737)
- Data Collector creates (another) instance of a repeatable form for a specific participant in a specific event(8hrs) [#1786](https://github.com/Tangerine-Community/Tangerine/issues/1786)
- Data Collector views which Participant they are filling out a form for [#1820](https://github.com/Tangerine-Community/Tangerine/issues/1820)
- Data Collector searches for a Case in a large dataset [#1893](https://github.com/Tangerine-Community/Tangerine/issues/1893)
  - Improvements to Case Home search - limit docs to 25 when no phrase is entered: #1871. Added rule to delay search in Case Home until at least two characters have been entered. Search results now sorted by date record updated.
- Lazy loading tabs in Case Home - this helps resolve some of the slowness in loading Case Home. Also disabled animations on tabs to remove jankiness.
  
### Developer Updates
- Re-enabled git config in Dockerfile - still having git networking error even when off corp network. 
- Updated docker-tangerine-base-image to v3.4.0
- New load testing doc.
- Added random name generation to the script that generates new cases - useful for load testing and checking how well search listing works. If using the 'case-mother' switch, record templates are pulled from your group.

### Upgrade instructions
On the server, backup your data folder and then run the following commands.

```bash
git fetch origin
git checkout v3.8.0
./start.sh v3.8.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.8.0.js
```

Replace all ocurrences of `localStorage.getItem('currentUser')` with `window.currentUser`.

## v3.7.2
- More fixes for upgrade process from v3.1.0.

## v3.7.1
- Fix translations update script.
- Fix client update process when upgrading from v3.1.0.

__Upgrade instructions:__
On the server, backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.7.1
./start.sh v3.7.1
docker exec tangerine translations-update
```

## v3.7.0
- __Fixes__
  - When editing forms, they will only save back to the server after clicking the top level "save" button. There is also now messaging around when the save either completes successfully or fails.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1645
  - On `<tangy-timed>` when using auto stop, return the property instead of the instead of the truthfulness of the value which is always false.
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/110
  - When uploadUnlockedFormReponses is set to true only incomplete forms are Synced up.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1725
  - In editor, modifying allowed pattern on text and number inputs does not work.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1770
  - Fix spacing between checkboxes in client
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1690
  - Fix click target and style for Case Event Form list
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1681
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1702
  - Fix Partial Date validation
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1683
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/71
  - EF Touch changes
    - `<tangy-eftouch multi-select go-next-on-selection="2">` should become `<tangy-eftouch multi-select="2" go-next-on-selection>`. This allows for expanding functionality of being able to use multi-select without go-next-on-selection but still limit the number of choices the user can make minus the transition.
    - `no-corrections` has been deprecated for new `disable-after-selection` attribute. When used with `multi-select`, the number of selections are still limited by the setting on `multi-select`, but changing selection is not allowed.
    - The `required` attribute when used with `multi-select` will only require just one value selected. If you need form example 2 selections to be valid, you can combine `required-all multi-select="2"`. 
    - We have an API change where we used to have `TangyEftouch.value.selection` was sometimes a string when not using `multi-select` and then when using `multi-select`, is was an array of strings. Now `TangyEftouch.value.selection` will always be an array of strings.
- __Features__
  - When editing forms, the user will be warned of any duplicate variable names that exist in the form.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1793
  - Improve messaging when an APK update fails to download
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1743
    - PR: https://github.com/Tangerine-Community/Tangerine/commit/2ede9d3fb9d43dda234bfdcfc4849769b9b08e69
  - Data Collector sends SMS message from form
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1745
  - Data Collector views events in schedule with icons, estimated date info, and scheduled date info
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1686
  - Data Collector views Case Module screens in French
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1711
  - Data Collector confirms case when opened
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1695
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1741
  - Improved support for changing color scheme of client app using `custom-styles.css`, possible to have "dark mode".
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1742
  - Data Collector shares all data on Device with other Users on the same Device.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1712
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1709
  - Data Collector finds Case Event status has changed to "complete" when all required forms are submitted.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1693
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1719
  - Data Collector finds all required Event Form instances in a Case Event are created upon opening the Case Event.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1691
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1718
  - Data Collector registers a Participant in a Case and views Event Forms grouped by Participant
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1692
    - PR : https://github.com/Tangerine-Community/Tangerine/pull/1723

__Upgrade instructions:__
On the server, backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.7.0
./start.sh v3.7.0
docker exec tangerine translations-update
```

## v3.6.5
- Fix timed grid output to exclude item level variables in logstash output https://github.com/Tangerine-Community/Tangerine/pull/1806

__Upgrade instructions:__
After the usual upgrade commands, also clear reporting caches with `docker exec -it tangerine reporting-cache-clear`.

## v3.6.4
- Fix usage of `T_CSV_MARK_DISABLED_OR_HIDDEN_WITH` in some cases.

## v3.6.3
- Allow disabled or hidden inputs output in CSV to be overridden using CSV_MARK_DISABLED_OR_HIDDEN_WITH in `config.sh`. The default value in `config.defaults.sh` is `"999"` which is what it has been for a few releases. When upgrading, do nothing if you want this to stay the same, otherwise use `"ORIGINAL_VALUE"` if you want to turn off the feature or set to your own custom value such as `"SKIPPED"`.

## v3.6.2
- Fix import of location list from CSV https://github.com/Tangerine-Community/Tangerine/pull/1732/commits/05e57e8f1bb869dbd52b927d45fc223903e201db

## v3.6.1
- Fix form routing for archived and active forms.
  - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1722
  - PR: https://github.com/Tangerine-Community/Tangerine/pull/1724
- Fix "Mark entire line as incorrect in grids is not reflected in csv #1713"
  - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1713
  - PR: https://github.com/Tangerine-Community/tangy-form/pull/103
  
## v3.6.0
- __New Features__
  - Support for changing the order of forms.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1523
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1707
  - Support for archiving a form.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1526
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1675
  - Improvements and support on all inputs for `error-text`, `hint-text`, `question-number`, and  content translations.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1655
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/88, https://github.com/Tangerine-Community/tangy-form/pull/86
  - Add support to `<tangy-qr>` for scanning data matrix codes.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1653
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/87
  - New "Capture Item at N Seconds" feature for `<tangy-timed>` will prompt Data Collector to mark which item the child last read after a specific amount of time.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1586
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/95
  - New `goTo('itemID')` helper function to navigate users to a specific item given some item level `on-change` logic.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1652
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/92
  - New `<tangy-signature>` input for capturing signatures.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1656 
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/90
  - Visibility of labels and/or icons on item navigation now configurable with `<tangy-form-item hide-nav-icons>` and `<tangy-form-item hide-nav-labels>`. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1682 
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/73
- __Fixes__
  - Fix Class tablets that are filling up their disk too fast.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1706 
  - Fix metadata print screen options 
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1703
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1670, https://github.com/Tangerine-Community/Tangerine/issues/1671
  - Fix missing camera permission blocking APK installs form using QR or Photo Capture
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1646, https://github.com/Tangerine-Community/Tangerine/issues/1578
  - Fix performance issues caused by needless TangyForm.on-change events from firing when they don't need to.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1656
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/89
  - Fix data collector reviews completed fullscreen form 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1629
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/75
  - `<tangy-eftouch auto-progress>` now distinguishes between going next on the time limit and going next on a number of selections. The API is now `<tangy-eftouch go-next-on-selection=2>` for going next on 2 selection and `<tangy-eftouch go-next-on-time-limit>` for going next on the time limit. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1597
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/84
  - `<tangy-eftouch>` content is now more likely to fit above the fold, not overlap with content above it, be more consistent on smaller screens, and also adapt to screen size changes. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1591, https://github.com/Tangerine-Community/Tangerine/issues/1587
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/79
  - `<tangy-eftouch>` suffered from going to next item twice due to time limit and selection being made at in a close window. This is now fixed. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1596
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/76
  - Fix Partial Date validation and for disabled attribute not reflecting 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1683
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/71
  - Fix variable names in Editor to allow for only valid variable names. 2 or more characters, begin with alpha, no spaces, periods, allow _ no dash
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1566, https://github.com/Tangerine-Community/Tangerine/issues/1558, https://github.com/Tangerine-Community/Tangerine/issues/1461
    - PR: https://github.com/Tangerine-Community/tangy-form-editor/pull/77
  - Fix for Autostop for radio buttons - 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1519
    - PR's: 
      - https://github.com/Tangerine-Community/Tangerine/issues/1590
      - https://github.com/Tangerine-Community/tangy-form/pull/100
      - https://github.com/Tangerine-Community/tangy-form/pull/100
- __Experimental Features__
  - When using the experimental Case module, Editors can now program forms to trigger the creation of a "Data Query" when Data Collectors are entering data. Data queries are then shown later in a "Data Queries" tab where clarification on prior data entered is requested.
    - PR: https://github.com/Tangerine-Community/Tangerine/pull/1661
  
__Upgrade instructions:__

On the server, backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.6.0
./start.sh v3.6.0
```

Now you may publish a release to your Devices and run the "Check for Update" on each Device. Note that if you are looking to use the QR Code scanner and you have been using Android Installation, you will need to reinstall the App on Devices and make sure to note the additional permissions installation instructions noted in the README.md file for enabling the App to have Camera Access. If using the Web Browser Installation, there is no need to reinstall the app for Camera access.



## v3.5.0
- __New Features__
  - Forms with fullscreen enabled now have a toggle button for the user to enable/disable fullscreen mode. Form designers may specify the number of taps in order for fullscreen to disable. https://github.com/Tangerine-Community/tangy-form/pull/51, https://github.com/Tangerine-Community/tangy-form/pull/72, https://github.com/Tangerine-Community/tangy-form-editor/pull/73
  - An `inputs` object keyed by input name is now available for use in `valid-if` statements. https://github.com/Tangerine-Community/tangy-form/pull/65
  - A new Partial Date item is available https://github.com/Tangerine-Community/tangy-form/pull/57
  - Translations updates. [#1613](https://github.com/Tangerine-Community/Tangerine/pull/1613)
  - New `custom-styles.css` file which can be added by modifying a group's assets folder. You may define CSS classes and then utilize them in the editor by adding them under each widget's class attribute.
  - New "Copy form" feature added to to Editor and more descriptive icon for adding a database record [#1627](https://github.com/Tangerine-Community/Tangerine/pull/1627)
- __Fixes__
  - Helper functions for timed grids are now safer, will not crash if a grid was skipped and info is not availble. https://github.com/Tangerine-Community/tangy-form/pull/61
  - Print view for a form had a bug where only the first page was printable. This is now fixed so that all pages may be printed. https://github.com/Tangerine-Community/Tangerine/pull/1605
  - Fix tangy-select test regression and work on EFTouch transition sound plays only on auto-progress [#137](https://github.com/Tangerine-Community/Tangerine/issues/1371)
  - API change in tangy-select - use of secondaryLabel is supported but deprecated; Use optionSelectLabel instead. [#1602](https://github.com/Tangerine-Community/Tangerine/issues/1602)
  - Fix the display of uploaded docs [#1609](https://github.com/Tangerine-Community/Tangerine/pull/1609)
  - Enable auto-stop for untimed grids [#1522](https://github.com/Tangerine-Community/Tangerine/issues/1522)
  - Increased clickable target for forms list and visits tab [#1628](https://github.com/Tangerine-Community/Tangerine/pull/1628)

  
__Upgrade instructions:__

Backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.5.0
./start.sh v3.5.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.5.0.js 
```

If any of your on-change logic looks into a form item's contents using `tangyFormItemEl.shadowRoot.querySelector(...)` or 
`this.$.content.querySelector(...)`, you must change it. The contents of the form can now be accessed at `tangyFormItemEl.querySelector(...)`. 

Also, the `content` element is no longer available.

For example:

```
// replace
var el = this.$.content.querySelector('tangy-input[name=\'classId\']')
//with 
var el = this.querySelector('tangy-input[name=\'classId\']')
```

The advantage of moving this content out of the shadow DOM is that you can now style it directly from your app.

## v3.4.0
- __New Features__
  - __New groups now ordered by creation date__: Creating new groups will now order them by the date the were created in the group list. [#1584](https://github.com/Tangerine-Community/Tangerine/issues/1584)
  - __Configurable Web App Device Orientation__: You can now specify the Web App orientation (portrait, landscape, or any) on device [using the `T_ORIENTATION` variable in `config.sh`](https://github.com/Tangerine-Community/Tangerine/issues/1530). Add `T_ORIENTATION="any"` to config.sh to have more flexible orientations for PWA's. The options for T_ORIENTATION are at https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation
  - __Media Library and Image support for Forms__: Each group now has a media library tab where they can uplaod images which can then be utilized when inserting the new "Image" item on forms. [#1138](https://github.com/Tangerine-Community/Tangerine/issues/1138)
   - __New ACASI widget__: The ACASI widget is braodly based on the EFTouch widget, but focused on a more static presentation of images and sounds. [#56](https://github.com/Tangerine-Community/tangy-form-editor/pull/56/commits/4f1d02d93ac0fc4637fb244b535b3411e35f131c)
   - __Configurable font size in grids__: You may now configure the font size in tangy-timed and tangy-untimed grids using the Option Font Size input. In tangy-form, it is exposed as option-font-size. Example of generated code: `<tangy-timed required columns="3" duration=80 name="class1_term2" option-font-size="5">`
   - __Auto-stop for tangy-radio-buttons__: Add support for autostop in tangy-radio-buttons [#49](https://github.com/Tangerine-Community/tangy-form/pull/49). In Editor, set the Threshold to the number of incorrect answers: [screenshots](https://github.com/Tangerine-Community/Tangerine/releases/tag/v3.4.0-prerelease-15). Autostop is implemented by using the hideInputsUponThreshhold helper, which takes a tangy-form-item element and compares the number of correct radio button answers to the value in its incorrect-threshold attribute. Example of generated code: `<tangy-form-item id="item1" incorrect-threshold="2">`
   - __New "correct" attribute for radio button options__: A new "correct" attribute has been added to tangy-list-item to store the correct value. There is a "Correct" checkbox next to each option. Example of generated code: 
   ```
   <tangy-radio-buttons name="fruit_selection2" label="What is your favorite fruit?">
      <option name="tangerine">Tangerine</option>
      <option name="cherry" correct>Cherry</option>
    </tangy-radio-buttons>
    ```
- __Fixes__
  - __Critical Sync and "data loss" fix__: Some variants of v3.3.x saw cases where data seemed to be lost on the tablet and sync no longer worked. After this release is deployed to the server, release for your groups and instruct all tablets to upgrade. The upgrade process may take many minutes depending on the amount of data stored on the tablet due to a schema update in the database. For an in depth look at what this update does, see [the code here](https://github.com/Tangerine-Community/Tangerine/blob/next/client/src/app/core/update/update/updates.ts#L159). 
  - __Logstash Improvements__ [#1516](https://github.com/Tangerine-Community/Tangerine/issues/1516)
    - User profiles were in a nested object, now they have been merged to be flat in the logstash output doc. [See example here](https://github.com/Tangerine-Community/Tangerine/pull/1563#issuecomment-506490643).
    - If a form response uses a location element, it will now be extracted out into a top level `"geoip"` property whose value is an object with `"lat"` and `"lon"` properties. [See example here](https://github.com/Tangerine-Community/Tangerine/pull/1563#issuecomment-506490643).
    - When new forms are created in the editor, they will no longer have a `.` character in their ID. This was causing some uneccessary and confusing logic in logstash config files. [See PR here](https://github.com/Tangerine-Community/Tangerine/pull/1560).
  - __EFTouch__: A large number of fixes have been made for EFTouch. See recent issues [here](https://github.com/Tangerine-Community/Tangerine/issues?q=is%3Aopen+is%3Aissue+label%3ATAN-EFTOUCH-2018). 
  - Updated to tangy-form-editor ^5.18.0 for [Change grid variables in CSV starting with variable_0 to variable_1](https://github.com/Tangerine-Community/Tangerine/issues/1537). 
  - A previous update to tangy-form to 3.15.1, tangy-form-editor to 5.17.0 to fixed [Editing form level HTML requires two Save clicks](https://github.com/Tangerine-Community/Tangerine/issues/1041)
- __Beta Features__
  - __Two-way Sync__: Allows for two-way sync of form responses. Can be configured to two way sync form responses for specific forms and also by geographic region defined in the user profile. See `docs/feature-two-way-sync.md`.
  and [Add a tangy input inside a tangy box duplicates items](https://github.com/Tangerine-Community/Tangerine/issues/1364), 
  and enable [Adjustable letter size for grids](https://github.com/Tangerine-Community/Tangerine/issues/1525)
  - __Case Module__
    - Add the "case" module to `T_MODULES` in `config.sh` and the default landing page for a group will be the cases search page and new "Case Management Editor" tab will appear in groups for creating and editing Case Definitions. [#1517](https://github.com/Tangerine-Community/Tangerine/issues/1517)
    - Clientside search of Forms for Case Management Groups allows Cases to be found using the device camera to scan a QR code. See `docs/case-management-group.md`.
    - Add event time and scheduling to Case Mangement Groups [#1518](https://github.com/Tangerine-Community/Tangerine/pull/1518)
    - New layout for Case and Case Event pages.

Upgrade instructions:

Backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.4.0
```

```
./start.sh
```

## v3.3.1
This release fixes a feature that made it into v3.3.0 but had a bug and was disabled. This release fixes that bug and makes it available.

- As an Editor user I want to be able to do an initial import of my location structure. [#1117](https://github.com/Tangerine-Community/Tangerine/issues/1117)
  
## v3.3.0
- Features
  - Assessor reviews high level case variables, AKA "Case Manifest" [#1399](https://github.com/Tangerine-Community/Tangerine/issues/1399)
  - Assessor changes language setting to Russian [#1402](https://github.com/Tangerine-Community/Tangerine/issues/1402)
  - Untimed Grid subtest [#1366](https://github.com/Tangerine-Community/Tangerine/issues/1366)
  - Editor Style Upgrades (April 2019) [#1421](https://github.com/Tangerine-Community/Tangerine/issues/1421)
  - Group Names can now have spaces and special characters [#1424](https://github.com/Tangerine-Community/Tangerine/pull/1424)
  - Editor configures Timed Grid to show or hide labels on buttons [#1432](https://github.com/Tangerine-Community/Tangerine/issues/1432)
  - Server Admin tunes the reporting delay between when an upload occurs and it shows up in reporting outputs [#1441](https://github.com/Tangerine-Community/Tangerine/issues/1441)
  - CSV output for single checkboxes now show up as "0" and "1" as opposed to "" and "on" [#1367](https://github.com/Tangerine-Community/Tangerine/issues/1367)
  - CSV output for single radiobuttons now show up as "0" and "1" as opposed to "null" and "on" [#1433](https://github.com/Tangerine-Community/Tangerine/issues/1433)
  - You can now limit who can add/see sitewide users to only the USER1 account by setting `T_USER1_MANAGED_SERVER_USERS` to `"true"` in `config.sh` [#1381](https://github.com/Tangerine-Community/Tangerine/issues/1381).
  - Client now has an "About" page with details about what Tangerine is [#1465](https://github.com/Tangerine-Community/Tangerine/issues/1465).

Upgrade instructions:

Backup your data folder and then run the following commands.
```bash
git fetch origin
git checkout v3.3.0
./start.sh
docker exec -it tangerine /tangerine/server/src/upgrade/v3.3.0.js 
```

## v3.2.0
- Features
  - Assessor changes language of App [#1315](https://github.com/Tangerine-Community/Tangerine/issues/1315)
  - Editor provides feedback given data entered earlier in the form [#1384](https://github.com/Tangerine-Community/Tangerine/issues/1384)
  - Assessor starts new Case is immediately forwarded to first form [#1362](https://github.com/Tangerine-Community/Tangerine/issues/1362)
  - Assessor finds Form and Event in Case has been disabled/enabled due to custom logic [#1363](https://github.com/Tangerine-Community/Tangerine/issues/1363)
  - Assessor confirms participant info using data from another form [#1385](https://github.com/Tangerine-Community/Tangerine/issues/1385)
  - Server Admin restarts machine to find containers have automatically come back up [#1388](https://github.com/Tangerine-Community/Tangerine/issues/1388)
  - Server Admin sets up Tangerine outage alarm [#1389](https://github.com/Tangerine-Community/Tangerine/issues/1389)
- Developer Notes
    - Ability to define database views on a per module basis in Client Angular [#1419](https://github.com/Tangerine-Community/Tangerine/pull/1419)
    - Integrate test harness and TypeScript with server using NestJS [#1413](https://github.com/Tangerine-Community/Tangerine/pull/1413)
    - Fix client tests, organize shared services and guards into the shared module, move client/app/ to client/ [#1398](https://github.com/Tangerine-Community/Tangerine/pull/1398)

Upgrade instructions:
```bash
git fetch origin
git checkout v3.2.0
./start.sh
docker exec tangerine /tangerine/upgrades/v3.2.0.js 
```
- In each group's `app-config.json`, change `"direction"` to `"languageDirection"`.
- If using a translation other than English, change in each group's `app-config.json`, change `"languageCode"` to the corresponding language code. Current codes other than `en` for English is `JO_ar` for Jordanian and `KH_km` for Khmer.

## v3.1.0
- Features
  - Item Editor UX Improvements #810 
  - Assessor verifies correct location selected by reviewing metadata of location #1191
  - As an assessor I'd like to include a hint option to be displayed below the question text #1279
  - Grids: helper functions for grids #1183
  - Ability to mark an entire row as incorrect on grids #1333
  - Assessor's backed up form responses are archived when storage is filling up #1304
  - Assessor scans a QR Code into form #1309
  - All hidden inputs have reporting values of `"999"` #1349
  - Merge reporting output of radiobuttons into one column.
- Bug fixes
  - Editor not properly logging users out resulting in getting stuck every 24 hours #1314 
  - Min and Max for input number cannot be saved through the interface #1297
  - time on grids cannot be changes and is always 60 seconds #1301
  - Unclosed tags in html container can break form #1289
  - Tangy timed option values disappear #1302


Note that #1349 will bve optional in future releases and you may not want to upgrade until that time.

Upgrade instructions:
```bash
git fetch origin
git checkout v3.1.0
./start.sh
docker exec tangerine reporting-cache-clear
```


## v3.0.0-beta13

### Upgrade instructions from v3 betas
```bash
git fetch origin
git checkout v3.0.0
# Note the new T_UPLOAD_TOKEN variable which is a replacement for the old upload account variables.
mv config.sh config.sh_backup
cp config.defaults.sh config.sh
vim config.sh
./start.sh
docker exec tangerine push-all-groups-views
docker exec tangerine reporting-cache-clear
```

For existing groups, you need to edit their `app-config.json` files in the `./data/client/content/groups` folders. Replace them with the following template and make sure to update variables such as `groupName`, `uploadToken`, and `serverUrl`.
```json
{
   "listUsernamesOnLoginScreen" : true,
   "modules" : [ ],
   "groupName" : "pineapple",
   "securityQuestionText" : "What is your year of birth?",
   "hideProfile" : false,
   "direction" : "ltr",
   "columnsOnVisitsTab" : [],
   "hashSecurityQuestionResponse" : false,
   "uploadUnlockedFormReponses" : false,
   "uploadToken" : "change this to match T_UPLOAD_TOKEN in config.sh",
   "securityPolicy" : [
      "password"
   ],
   "homeUrl" : "case-management",
   "serverUrl" : "https://f571f419.ngrok.io/",
   "centrallyManagedUserProfile" : false,
   "registrationRequiresServerUser" : false
}
```

### New features since v3.0.0-beta12
- Server admin imports client archives into server #1166
  - After exporting data from clients, we now have an easy command line tool to import them. Place those exported files in `./data/archives` folder and then run `docker exec tangerine import-archives`.
- Consumers of reporting API find user profile data appended to form responses #1147
  - New `logstash` module for installations that want to use logstash to migrate data to an Elastic Search instance.
  - Enable by adding `logstash` to the list of modules in `config.sh`, then clear reporting caches `docker exec -it tangerine bash; cd /tangerine/server/src/scripts; ./clear-all-reporting-cache.js;`.  You will find new `<groupName>-logstash` databases in CouchDB that you can configure logstash to consume.
- Upload Tokens instead of upload usernames and passwords. 
  - In your `config.sh` change `T_UPLOAD_TOKEN` to a secret phrase and then in existing groups add that to `app-config.json` as an `"uploadToken"` property and `uploadUrl` to `serverUrl` but without the username and password and `upload/<groupName>`. For example, `"uploadUrl": "http://uploader:password@foo.tangerinecentral.org/upload/foo"` would become `"serverUrl":"http://foo.tangerinecentral.org", "groupName":"foo", "uploadToken":"secret_foo_passphrase"`.
  - If you not planning on updating clients right away, in `config.sh` set `T_LEGACY="true"` to support the older upload API that those clients expect. When all clients are upgraded, set that variable back to false.
- Editor edits location list for group #982
  - @TODO
- Editor creates, edits, and deletes form responses on the server #1047
- Editor exports CSV of a form for a month of their choosing #1143
- Editor sees user profile form related columns joined to CSV of all forms #1142
- On client, prevent users from editing their own profile.
  - To impact new groups, change `T_HIDE_PROFILE` to `"true"` in `config.sh` .
  - To modify existing groups, change `"hideProfile"` in group level `app-config.json` to `true`.
- Assessor registers on tablet, downloads form responses created on server #1129
  - On device registration, after user creates account, will force user to enter 6 character code that references online account.
  - To impact new groups, change `T_REGISTRATION_REQUIRES_SERVER_USER` to `"true"`.
  - To modify existing groups, change `"registrationRequiresServerUser"` in group level `app-config.json` to `true`.
- Editor updates client user profile on server, Assessor sees updated profile after next sync #1134
  -  On client sync, will result in any changes made to a user profile on the server to be downloaded and reflected on the client.
    - To impact new groups, change `T_CENTRALLY_MANAGED_USER_PROFILE` to `"true"` in `config.sh`.
    - To modify existing groups, change `"centrallyManagedUserProfile"` in group level `app-config.json` to `true`.
- Editor views tangy-timed items_per_minute calculation in the CSV #1100
- `<tangy-location>` can be filtered by entries in the profile by adding attribute `<tangy-location filter-by-global>`. In the editor when editing a `<tangy-location>` you will find a new option "Filter by locations in the user profile?" you can check.
- Advanced forms features (no GUI for these features)
  -  `<tangy-input-group>` can be used to create repeatable groups of inputs. See the demo [here](https://github.com/Tangerine-Community/Tangerine/issues/1055#issuecomment-427451539). 
  - Geofence for v3 #941
    - If you location list has `latitude` and `longitude` properties for each location, you can validate your `<tangy-location>` selection given a geofence in `<tangy-gps>`. See the screenshots [here](https://github.com/Tangerine-Community/Tangerine/issues/941#issuecomment-400778890) and a code example of how to build this in your form [here](https://github.com/rjsteinert/tangerine-forms-for-cyanobacteria-surveillance-at-burlington-vermont-beaches/blob/master/cyanobacteria-surveillance-form/item-1.html).
- Upload incomplete form responses (important for Class module)
  - To modify existing groups, set `"uploadUnlockedFormReponses"` to `true` in `app-config.json`.
- Server Admin clears reporting cache #1064
- Server Admin runs script to update views in databases #962
- Server Admin limits by site or by group the number of form responses uploaded end up in reporting outputs #1155
  - This feature brings two new settings to `config.sh`.
  - Set `T_PAID_MODE` to `"site"` to limit on a sitewide level, use `"group"` to limit on a per group level.
  - Set `T_PAID_ALLOWANCE` from `"umlimited"` to a specific number like `"1000"` to limit form responses that end up in reporting outputs to one thousand. 
  - This mechanism works by marking uploaded form responses as "paid". When you first upgrade to this release, none of your form responses will be marked as paid and will not end up in reporting outputs until they are marked as paid against the allowance. If you want to mark all current uploaded form responses as paid and only mark against their allowance for future uploads, set the allowance to unlimited and after the reporting caches have been built, set the allowance desired and run `./start.sh` again. 
- Optional Modules you can turn on and off in `config.sh` `T_MODULES` list.
  - Note that if you are going to override the default `T_MODULES` list with an additional module such as `class`, don't forget to add modules such as `csv` if you still need them! 
- Reporting outputs (inluding CSVs) include the information about the number of children a location has. #1174

### Known issues
- Memory leak results in `Error: spawn ENOMEM` #886
  - On the server command line run `crontab -e` and then add the following entry to restart the program every 24 hours `0 0 * * * docker stop tangerine; docker start tangerine`.

## 2.0.0 (pre-release)

### User Stories
- As a Tangerine Database admin, I want to control which users have the "Manager" role for creating new groups [#218](https://github.com/Tangerine-Community/Tangerine/issues/218)
- As a Tangerine Editor User, I expect to see timestamps on CSVs down to the second [#223](https://github.com/Tangerine-Community/Tangerine/issues/223)
- As a user, if I end up on a http:// URL I want to be redirected to the https:// version of that URL [#98](https://github.com/Tangerine-Community/Tangerine/issues/98)

### Bugs
- New groups default Client tabs are set up for workflow, should be vanilla tangerine [#230](https://github.com/Tangerine-Community/Tangerine/issues/230)
- When Tangerine is first installed, User1 does not have the required Manager role so groups cannot be created [#229](https://github.com/Tangerine-Community/Tangerine/issues/229)
- School Location Subtest does not render after upgrading from Tangerine 0.4.x to v2.0.0 [#189](https://github.com/Tangerine-Community/Tangerine/issues/189)
- If a group was upgraded from 0.x.x and does not have a media folder, APK generating fails [#186](https://github.com/Tangerine-Community/Tangerine/issues/186)
- Deleting group does not set security correctly on resulting "deleted" database [#227](https://github.com/Tangerine-Community/Tangerine/issues/227)
- Large CSVs fail to generate [#221](https://github.com/Tangerine-Community/Tangerine/issues/221)
- When a new Workflow is created it is missing retrictToRole, reporting, and authenticityParameters [#228](https://github.com/Tangerine-Community/Tangerine/issues/228)
- Ensure /var/log/couchdb exists so CouchDB does not crash [#216](https://github.com/Tangerine-Community/Tangerine/issues/216)

### Technical
- Document how to use SSL with Tangerine [#219](https://github.com/Tangerine-Community/Tangerine/issues/219)
- Things to add to .gitignore [#185](https://github.com/Tangerine-Community/Tangerine/issues/185)
- Clean up build process so client does not need to compile twice [#74](https://github.com/Tangerine-Community/Tangerine/issues/74)

### Upgrade directions
- This is the first release with upgrade scripts so you will need to run all upgrade scripts between the version you started at and this one. 

For example, if you are at Tangerine 0.4.6, then you must run...
```
docker exec -it tangerine-container /tangerine-server/upgrades/v1.0.0.sh
docker exec -it tangerine-container /tangerine-server/upgrades/v2.0.0.sh
```

If you are at Tangerine 1.7.8, then you must run...
```
docker exec -it tangerine-container /tangerine-server/upgrades/v2.0.0.sh
```

## v2.2.0

### User Stories
- As a Site Owner I want to know how many results have been uploaded given arbitrary time period #457

### Technical 
- Refactor start.sh and config.defaults.sh to allow configurable ports and tag #456

### Upgrade direcections
```
docker exec -it tangerine-container /tangerine-server/upgrades/v2.2.0.sh
```




