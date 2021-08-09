# What's new

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




