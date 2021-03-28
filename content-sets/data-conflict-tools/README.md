# tangerine-data-conflicts-browser

## Install

### Step 0
Add the contents of the editor folder in this content set to your content set.

### Step 1
Add required view in group database:

`_design/conflicts/_view/conflicts`

```
function(doc) {
  if (doc._conflicts) {
    emit(doc._id, doc._conflicts.length)
  }
}
```

### Step 2
Create a `${groupId}-conflict-rev` database.

### Step 3
Add required view in group conflict rev database:

`_design/byConflictDocId/_view/byConflictDocId`

```
function (doc) {
  emit(doc.conflictDocId, doc.conflictRev);
}
```
Set reduce to `_count`.

### Step 4
Create a `${groupId}-log` database.
