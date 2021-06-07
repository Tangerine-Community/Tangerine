# Deletion Strategy

## Introduction:

Our goal is to have deletions on the client to follow deletions on the server. Sadly, this is not possible yet. For now, we will focus on deleting data on the server.

## Deleting a record in Tangerine

Open the document in Fauxton. Click the "Delete" button on the right hand side of the header to delete. This will create a bare-bones document that includes the _deleted" flag. By default, deleted docs are not included in replication; however, there is a way to query them (see below).

## Testing deletions

When you open a new case on client, don't enter any data, but click next. The app does create a case and it can be sync'd. Although the case does not display in the case home search results on client, this record does get output on the server via CSV export. 

When you use the Delete button in Fauxton, it removes all data except for this tombstone:

```json
{
  "_id": "6c27f5c8-6e08-4245-ae57-cef7d63099de",
  "_rev": "2-28819102bb2ec0e3390f28d94467212a",
  "_deleted": true
}
```

When the client syncs, it does not get this new rev.

## Viewing deletions:

```shell
curl -X POST -H "content-Type: application/json" "http://admin:password@localhost:5984/group-2627a0a7-852a-4f51-9d5d-b7ae53130976/_changes?filter=_selector" -d '{"selector": {"_deleted": true}}'
```

response:

```json
{
  "results": [
    {
      "seq": "16-g1AAAAIBeJyVz0sOgjAQBuABjI-FZ9AjUJpaXMlNtC8CBNuFutab6E30JnqTWh4J0UQDm5nkz8yXmRIAplkgYa6NNlIl2mTmcCxd7DPgC2ttkQVsvHfBhIRrgST5Hv6xzpeu8k0reLWgMBacx32FpBK2reDXAltRRGLcV9hVwvlDEDiKKev7hR65ChfXHHLtFIIICzkdpNwa5d4pVDIs0mG3PBrlWSlQK5HCKUJIwuykpUpzreRf4dUItmBe8QYjK50u",
      "id": "6c27f5c8-6e08-4245-ae57-cef7d63099de",
      "changes": [
        {
          "rev": "2-28819102bb2ec0e3390f28d94467212a"
        }
      ],
      "deleted": true
    }
  ],
  "last_seq": "20-g1AAAAIfeJyV0F0OgjAMAOAp_j54Bj0CY5mDJ7mJbusIEtwe1Ge9id5Eb6I3wTFIiBoNvLRJ035pmyOEJqkHaKaNNqBibVKzP-S23OdIzIuiyFKPj3a2MKZ-JDHQz-Yf42Jho1jVQs8JihApRNhWiEthXQt9J_AlwzQkbYVNKZzeBEmCkPG2V-iBjehsk0UujUIx5b5gnZRrpdwahQEnMum2y71SHqWCnBIokmCMAU2PGlSy1Qr-Cs9KcD8ZOiEBSUX09dXsBf6mphA",
  "pending": 0
}

```

To get deleted doc, use the rev:
http://localhost:5984/group-2627a0a7-852a-4f51-9d5d-b7ae53130976/6c27f5c8-6e08-4245-ae57-cef7d63099de?rev=2-28819102bb2ec0e3390f28d94467212a

## How to create deletions on client

Potential steps:
- Use the _changes example above to get a list of deleted docs on the server.
- Process the results and use the pouchdb remove function on each doc/rev.

## Restoring deleted documents

Get the revs for the deleted doc:

```shell
curl -H 'Accept: application/json' 'http://server:5984/group-uuid-devices/6013f414-6401-4903-b0f9-fb862779cc3f?revs=true&open_revs=all'
```

Command returns:


```json
{
  "_id": "6013f414-6401-4903-b0f9-fb862779cc3f",
  "_rev": "4-46fb2d064595bb6b2068b20450f2a3f9",
  "_deleted": true,
  "_revisions": {
    "start": 4,
    "ids": [
      "46fb2d064595bb6b2068b20450f2a3f9",
      "59e68396a5b632f62e3ab3930dda3d45",
      "09463546fcf1177408821fccada40269",
      "e3af953eab52ed5f3d56c9f57fdeb2f9"
    ]
  }
}
```

Get the previous rev id by subtracting 1 from the _revisions.start property and appending the value of the second element in the _revisions.id array:

Result should be `3-59e68396a5b632f62e3ab3930dda3d45`

Now query the server for that _rev:

http://server/group-uuid-devices/6013f414-6401-4903-b0f9-fb862779cc3f?rev=3-59e68396a5b632f62e3ab3930dda3d45

To overwrite the old deleted entry you have to post or put back the document with the correct id and the latest revision number (not the pre delete revision number, but the revision number the document has now it has been deleted).

An easier way to do this is to use the COPY command:

curl -X COPY "server:5984/group-uuid-devices/6013f414-6401-4903-b0f9-fb862779cc3f?rev=3-59e68396a5b632f62e3ab3930dda3d45" -H "Destination: 6013f414-6401-4903-b0f9-fb862779cc3f"
