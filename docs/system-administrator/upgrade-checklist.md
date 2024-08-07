

## Test on QA server
* [ ] Clone production server to QA server.
* [ ] Remove all cronjobs that may be pushing to remote git repositories.
* [ ] Remove all CouchDB replications that may be pushing data to remote CouchDBs.
* [ ] Update `T_HOSTNAME` in `tangerine/config.sh`.
* [ ] Run `./start.sh <currently used version of tangerine>`. This puts the updated config in `config.sh` into the container.
* [ ] Update `serverUrl` in all `app-config.json` files for each group in `tangerine/data/group/<your-group-id>/client/app-config.json`.  Find and replace from the tangerine folder by modifying the following command: `find ./data/groups/ -type f -name "app-config.json" -print0 | xargs -0 sed -i '' -e 's/production-server-hostname/qa-server-hostname/g'`
* [ ] Release all APKs and PWAs. This puts all updated app config into the APKs and PWAs.
* [ ] Install and set up PWA/APKs for groups to test.
* [ ] Upgrade the QA server following the server instructions for the release you are upgrading to in `CHANGELOG.md` (https://github.com/Tangerine-Community/Tangerine/blob/master/CHANGELOG.md). Note that you must upgrade incrementally between the versions. If you skip one you may miss important updates or they may not apply correctly and you risk corrupting your install without knowing it.
* [ ] Test functionality on the server.
* [ ] Release updated APKs and PWAs.
* [ ] Upgrade test tablet and test functionality.


## Deploy to production
* [ ] Make backup of production server.
* [ ] Release PWAs/APKs on the test channels for all groups.
* [ ] Install and set up PWA/APKs for groups to test using APK/PWA on the test channel.
* [ ] Upgrade the QA server following the server instructions for the release you are upgrading to in `CHANGELOG.md` (https://github.com/Tangerine-Community/Tangerine/blob/master/CHANGELOG.md). Note that you must upgrade incrementally between the versions. If you skip one you may miss important updates or they may not apply correctly and you risk corrupting your install without knowing it.
* [ ] Test functionality on the server.
* [ ] Release updated APKs and PWAs on the test channel.
* [ ] Upgrade test tablet and test functionality.
* [ ] Release updated APKs and PWAs on the live channel.
* [ ] Note the Build ID of the APK or PWA on the live channel, then in the content repository tag a release with a corresponding Build ID in git. If using Github, use the Releases feature and note the version of Tangerine upgraded to along with any other notes.
* [ ] Terminate the QA server.




