# Managing Data Conflicts 
When using Sync Protocol 2 we can sync data down to Devices. Because of this it is possible for two Devices to edit the same data between syncs. This causes a "Data Conflict". When a Device is syncing and a conflict is detected. 

To manage Data Conflicts you will need to know the IP Address of your server and have the CouchDB Admin credentials found in `config.sh`.

## Step 1: Find Documents with Conflicts

Go to `<serverIpAddress>:5984/_utils/#database/<groupId>/_design/shared_conflicts/_view/shared_conflicts`.  This is a list of Documents with conflicts. Click the first one in the list which will open the Document with conflicts. Note this doc has link in the second bar from the top on the right with label of "Conflicts".

## Step 2: Merge Conflict Revisions contents into Doc
With the Document open, in Fauxton, copy the URL and open another window with the same URL side by side. On the window on the left, click the "Conflicts" link in the top right of that window. Note the "Conflicting Revisions" drop down in the Conflicts Browser. These Conflicting Revisions are the contents of Documents that were the "losing revision" when in a conflict. Selecting a "Conflict Rev" in the Conlict Revisions dropdown will result in the difference between the Conflicting Revision's contents and the current revision's contents. JSON highlighted in green belongs to the Conflict Rev. 

Cycle through each of the Conflict Revs migrating JSON highlighted in green over to the current Document edit view in your browser on the right. When all contents in the Conflict Revs have been migrated (AKA "merged") into the current Document, save the current doc with the changes and proceed to the next step.

## Step 3: Archive Conflict Revisions

Use the `pouchdb-couchdb-archive-conflicts` CLI tool to archive the conflicts in the Document. This will result in removing the Document for the conlist list in step 1 and save a copy of each conflict revision into ``<serverIpAddress>:5984/_utils/#database/<groupId>-conflict-revs/`.

Install the tool. Requires Node.js (https://nodejs.org/).
```
npm install -g pouchdb-couchdb-archive-conflicts
```


```
archive-conflicts http://<username>:<password>@<serverIp>:5984/<groupId> <docId> 
```

Now return to Step 1 and pick the next Document in the list.


## Reviewing Archived Conflict Revisions

To review a Documents archived conflict revisions, add a `byConflictDocId` view to the database.

```
function (doc) {
  emit(doc.conflictDocId, doc.conflictRevId);
}
```

When viewing this view you can then click "Options" and enter the follwing under "By Keys" `["<docId>"]`.

