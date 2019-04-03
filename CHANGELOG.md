# Changelog

## v3.3.0
- Features
  - Assessor reviews high level case variables, AKA "Case Manifest" [#1399](https://github.com/Tangerine-Community/Tangerine/issues/1399)
  - Assessor changes language setting to Russian [#1402](https://github.com/Tangerine-Community/Tangerine/issues/1402)
  - Location import from csv [#1117](https://github.com/Tangerine-Community/Tangerine/issues/1117)
  - Untimed Grid subtest [#1366](https://github.com/Tangerine-Community/Tangerine/issues/1366)
  - Editor Style Upgrades (April 2019) [#1421](https://github.com/Tangerine-Community/Tangerine/issues/1421)

Upgrade instructions:
```bash
git fetch origin
git checkout v3.3.0
./start.sh
docker exec -it tangerine translations-update
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


## v3.0.0-beta13 (in progress)

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




