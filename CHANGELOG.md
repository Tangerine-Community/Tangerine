# Changelog

## v3.6.0
- __New Features__
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




