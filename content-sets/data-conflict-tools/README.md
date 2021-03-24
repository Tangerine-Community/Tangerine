# tangerine-data-conflicts-browser


Required view in group database:

`_design/conflicts/_view/conflicts`

```
function(doc) {
  if (doc._conflicts) {
    emit(doc._id, doc._conflicts.length)
  }
}
```

Required view in group coflict rev database:

`_design/byConflictDocId/_view/byConflictDocId`

```
function (doc) {
  emit(doc.conflictDocId, doc.conflictRev);
}
```
Set reduce to `_count`.
