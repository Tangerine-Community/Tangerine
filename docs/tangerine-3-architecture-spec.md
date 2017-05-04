# Tangerine v3 Architecture Specification (DRAFT)


## Schema

### Spreadsheet
```
{
  _id: "ced3aca4-3101-11e7-93ae-92361f002671",
  _rev: "ffb6a664-3101-11e7-93ae-92361f002671",
  collection: "Spreadsheet",
  title: "...",
  schemas: [
    {
      _id: "dd74f132-3101-11e7-93ae-92361f002671"
      collection: "SpreadsheetSchema",
      spreadsheetId: "ced3aca4-3101-11e7-93ae-92361f002671",
      status: "canonical",
      sheets: {
        "master": [
          "RowUUID",
          "Column Name 1",
          ...
        ],
        "Student Reading Comprehension Observations P1": [
          "RowUUID",
          "MasterRowID",
          "Column Name 1"
          ...
        ],
        ...
      },
      parent: {
        _id: "ffb6a664-3101-11e7-93ae-92361f002671",
        spreadsheetId: "ced3aca4-3101-11e7-93ae-92361f002671",
        parentSchemaId: "dd74f132-3101-11e7-93ae-92361f002671",
        columnMapping: {
          "ColumnName1": "Column Name 1",
          ...
        }
      }
    },
    {
      _id: "dd74f132-3101-11e7-93ae-92361f002671"
      collection: "SpreadsheetSchema",
      status: "deprecated",
      sheets: {
        "master": [
          "RowUUID",
          "Column Name 1",
          ...
        ],
        "Student Reading Comprehension Observations P1": [
          "RowUUID",
          "MasterRowID",
          "Column Name 1"
          ...
        ],
        ...
      }
      parent: "root"
    }
  ]

}
```

### Spreadsheet Wizard 
```
{
  _id: "43a883f3-9277-42ec-b93b-f037b8a3da4a",
  _rev: "1-045b5094-e6c8-4603-8c12-f909eae744de",
  title: "..."
  collection: "SpreadsheetWizard",
  name: "Wizard for P1 School Observations Spreadsheet v3"
  status: "published",
  spreadsheetId: "ced3aca4-3101-11e7-93ae-92361f002671",
  spreadsheetRevision: "ced3aca4-3101-11e7-93ae-92361f002671",
  spreadsheetSchemaId: "dd74f132-3101-11e7-93ae-92361f002671"
  _children: [ ... ]
}
```

### Section
```
{

  //
  // Metadata
  //
  collection: "section",
  title: "Section 1",

  //
  // Children Section(s) or Item(s)
  //
  children: [ ... ],

  //
  // Section features.
  //

  // Special name spacing column name so features can save data like `<Section.columnName>_went_over_time`.
  columnName: "..."
  // Will result in a new variable in the result called `<Section.columnName>_stopwatch`.
  stopwatch: true,
  // Maybe...
  time_limit: "5 minutes"

  //
  // Skip logic, arbitrary code execution on events.  
  //

  // Arbitrary code execution on events of beforeReady, onReady, onSubmit, onFail, etc..
  // `scope` is an object of temporary variables being used in this scope.
  code: "function(event, variables, scope, callback) { ... }"

  //
  // Safety rails when using code gives allows for error detection when copying
  // sections from one Workflow to another.
  //

  // columnNames that this section declares.
  declarations: [ ... ],
  // Define columnNames that will be used in the code.
  imports: [ ... ],

  //
  // Section navigation features
  //

  // Signals the UI the section is repeatable.
  repeatable: true,
  // If a section is repeating, it will need it's own section sheet apart from the master spreadsheet.
  sheetName: 'Student Observations for English P2'
  // Alternatively, there could be no extra sheets and instead iterate columns
  // like `<Section.variableName>_pass_<Nth>_<variable>`. This leads to inconsistent
  // spreadsheet schema depending on your results.
  columnName: 'Student Observations for English P2'
  // Number of times to repeat the section. Set to 0 to let user decide how many times.
  repeatN: 3,
  // When stepping through sections in the UI, forking gives the user to choose their path.
  // After they finish the section they choose, they are returned to the path selection.
  // If repeatable is false, user may only go down a path once. When all paths are exhausted,
  // they are automatically forwarded.
  forkable: true
}
```

### Page
```
{
  title: "Page 1",
  collection: "Page",
  columnNames: [ "Column Name 1", "Column Name 2", ... ],
  // Custom config for the Item Type generated when edited.
  config: { ... }
}
```

### Row
```
{
  //
  // Meta data.
  //
  _id: "cb5400e4-8532-4121-a43a-6f17b109908a",
  _rev: "4-88daad28-27e6-410b-920b-07259bf78ba4",
  collection: "Row",
  spreadsheetId: "11574cdf-eafd-4506-a452-25573c5f9441",
  spreadSheetRevision: "f7a00dd5-a19d-4e23-aba6-77933e126c12"
  spreadSheetSchemaId: "10d09189-26e6-4b33-a3ea-64f6d86c3c4d"
  userId: "d04d801c-83c1-47c2-8015-a20382d54aac",
  caseId: "7f8fdab9-e4f4-4605-b960-c58a078f9b03",
  // Last state of the result, derived from Section's
  // variableName properties and the Item IDs.
  path: "/Part 1/Section 5/2a69a46b-d606-40da-8160-8718dd1b3604",
  // Items can return two things. Variables and logs.
  tangerineVersion: 'v3.0.1',
  tangerineBuild: 'cbefb754-6493-4ca6-99fb-7c77a92a59fa',
  deviceInfo: 'ASUS Nexus 6 T-DQ82',
  //
  sheets: {
    "master": {
      "Row ID": "cb5400e4-8532-4121-a43a-6f17b109908a",
      "Column Name 1": "foo",
      "Column Name 2": "bar",
      ...
    },
    "Student Reading Comprehension Observations P1": {
      "Row ID": "cb5400e4-8532-4121-a43a-6f17b109908a",
      "Column Name 1": "foo",
      "Column Name 2": "bar",
      ...
    }
  }
  // Event log catch all for advanced processing later.
  log: [
    { ... },
    ...
  ]
}
```

