# Sync Strategies

## Overview
The choice of sync strategy impacts how Tangerine syncs with the server. If you configure a form to use two-way sync, it uses CouchDB replication; otherwise, it uses custom sync. How are these two types of sync different?
- CouchDB replication: 
-- If there is conflicting data on the server, the document update fails and it creates a log of the conflict on the uploaded document
-- It currently does not notify the tablet user that there was a conflict. The data on the server displays the previous data, not the new, conflict data. See below how to view the new, conflict data.
-- Uses more bandwidth
- Custom sync
-- If there is conflicting data on the server, it overwrites the document and does not make a log of the conflict. It uses the [pouchdb-upsert](https://github.com/pouchdb/pouchdb-upsert) plugin to do the write.
-- Uses less bandwidth

## How to tell if there are conflicts when using CouchDB replication?
Add "conflicts=true" to the url if checking view curl, or in your application, add {conflicts: true} option when you get() it. It will list the conflicts:

```
_conflicts:[
"29-0003a0b8af090d907efecde3aa121416",
"25-f712a217de615f44c66ddb16b1a53a19",
"14-bad1258430d22ad41dc9ce4123283c4f",
"5-3fcde4c45f910b7a0c541e837e4ffd3c"
]
```

Query the form using "rev" in the querystring to view the conflicted version.

```
http://localhost:5984/group-58093841-eaeb-4e51-8675-29757d71fd35/3cec5368-7b89-43cd-9c59-bcd1584dd4ea?rev=5-3fcde4c45f910b7a0c541e837e4ffd3c

```

See https://pouchdb.com/guides/conflicts.html for more information.

