# Changelog

## 2.0.0 

### User Stories
- As a Tangerine Database admin, I want to control which users have the "Manager" role for creating new groups #218
- As a Tangerine Editor User, I expect to see timestamps on CSVs down to the second #223
- As a user, if I end up on a http:// URL I want to be redirected to the https:// version of that URL #98

### Bugs
- New groups default Client tabs are set up for workflow, should be vanilla tangerine #230
- When Tangerine is first installed, User1 does not have the required Manager role so groups cannot be created #229
- School Location Subtest does not render after upgrading from Tangerine 0.4.x to v2.0.0 #189
- If a group was upgraded from 0.x.x and does not have a media folder, APK generating fails #186
- Deleting group does not set security correctly on resulting "deleted" database #227
- Large CSVs fail to generate #221
- When a new Workflow is created it is missing retrictToRole, reporting, and authenticityParameters #228
- Ensure /var/log/couchdb exists so CouchDB does not crash #216

### Technical
- Document how to use SSL with Tangerine #219
- Things to add to .gitignore #185
- Clean up build process so client does not need to compile twice #74

### Upgrade directions
- Add `manager` role to your User1 user.
- Run all upgrade scripts between the version you started at and this one. For example, `docker exec -it tangerine-container /tangerine-server/upgrades/1.0.0.sh`
