# Managing Data Conflicts 
When using Sync Protocol 2 we can sync data down to Devices. Because of this it is possible for two Devices to edit the same data between syncs. This causes a "Data Conflict". When a Device is syncing and a conflict is detected, the Tangerine software will try to resolve that conflict by merging the two versions. When Tangerine does this, it creates a "Conflict Issue" which stores the two versions and the merged version for safe keeping (in Issue this is refered to as A, B, and Merged). These are important to review in the Issue queue to ensure that the merge is satisfactory. Sometimes a merge will not be possible and the data will be left in a Conflict state according to CouchDB's definition of Conflict. 

To manage Data Conflicts you will need to know the IP Address of your server and CouchDB Admin credentials found in `config.sh`.

## Monitor how many Conflict Issues there are by Document ID
1. Go to `<serverIpAddress>:5984/_utils/#/database/group-479f455e-b1bd-481b-8bd7-0d985a07431c/_design/issuesOfTypeConflictByConflictingDocTypeAndConflictingDocId/_view/issuesOfTypeConflictByConflictingDocTypeAndConflictingDocId`
1. Click wrench for view on left hand column, make sure "Reduce: Count" is enabled on the view.
1. Click "Options", check "Reduce" and then set "Group Level" of 2. 


## Monitor how many active Database Conflicts by Document ID
1. Go to `<serverIpAddress>:5984/_utils/#database/group-479f455e-b1bd-481b-8bd7-0d985a07431c/_design/shared_conflicts/_view/shared_conflicts`
1. Click wrench for view on left hand column, make sure "Reduce: Count" is enabled on the view.
1. Click "Options", check "Reduce" and then set "Group Level" of 1. 

## Viewing the history of Documents in the database
Sometimes it helps to look back at the history of a Case. When a Case is open in Tangerine Editor, you can run the following in the Chrome Devtools Console.

```
await T.case.getCaseHistory()
```

To look at the full picture that CouchDB server is aware of, use the following URL structure...

```
<serverIpAddress>:5984/<groupId>/<docId>?revs_info=true
```
You will find the response contains a `_revs_info` property with an array of revisions. If a revisions has `"status"` of `"unavailable"`, then that revision is on the Device it came from. You can find out which Device likely has that revision by finding the next available revision, getting the doc at that revision, and inspecting the `modifiedByDeviceId` property. This is the version of the doc that was uploaded to the server. 

```
<serverIpAddress>:5984/<groupId>/<docId>?rev=<revId>
```

