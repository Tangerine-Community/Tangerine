# Tips for making queries for Reports using Mango

Mango is a query language available to Couchdb based upon MongoDB. 

# General info about Mango:

- https://pouchdb.com/guides/mango-queries.html
- https://docs.couchdb.org/en/stable/api/database/find.html
- https://github.com/cloudant/mango

# Some things to watch out for:

## Sorting

Add the key you're sorting upon - in the following case, it is `tangerineModifiedOn` - to the index:

```
 await createIndex({
    index: {
      fields: [
        'type',
        'status',
        'tangerineModifiedOn'
      ]
    }
  })
```

## $or and $ne

Mango abandons the indexes and does live queries, which can cause the query to fail. For $ne you can do a [partial filter](https://docs.couchdb.org/en/stable/api/database/find.html#partial-indexes) to improve performance. 

Here is a good discussion of the issue w/ these Mango expressions: https://stackoverflow.com/a/41897093

Here is an example of this issue in Tangerine: [#2367](https://github.com/Tangerine-Community/Tangerine/issues/2367)

Example lifted from the Couch doc on Partial Indexes:

```

To improve response times, we can create an index which excludes documents where "status": { "$ne": "archived" } at index time using the "partial_filter_selector" field:

{
  "index": {
    "partial_filter_selector": {
      "status": {
        "$ne": "Open"
      }
    },
    "fields": ["type", "status", "tangerineModifiedOn"]
  },
  "ddoc" : "type-not-open",
  "type" : "json"
}
```
