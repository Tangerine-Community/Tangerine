# Custom Case Reports

The Custom Case Reports features enables the developer to create custom reports or a dashboard. This feature is accessible using a tab when viewing a case. To enable this feature, add `showCaseReports: true` to the group's app-config.json. 

## Demo and description of this feature's assets

This demo is based on the [case module content set](https://github.com/Tangerine-Community/Tangerine/tree/release/v3.11.0/content-sets/case-module); therefore, you might want to install that in order to follow the demo.

There are three files used for custom reports, which must be placed in the group directory. 

1. [queries.js](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.11.0/content-sets/case-module/queries.js) - has the map/reduce queries used to index the docs. Note that the sample queries.js file has a function called registrationResults with a map and a reduce query. The map function is explained above; the reduce uses Couchdb's built-in _sum keyword. 

The queries in this doc are installed when the app is installed. Support for updating these queries is not yet implemented. 

2. [reports.js](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.11.0/content-sets/case-module/reports.js) - runs the queries and fills out the content for reports.html. The reduce function is used to provide the counts in report2. The options in report2 `options = {reduce: true}` activate the reduce function. 

3. [reports.html](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.11.0/content-sets/case-module/reports.html) - provides a basic html frame for the data. 

## Helper functions

When writing queries or organizing the javascript logic to fetch the results, use the globally-exposed T.form.Get function to get the value of inputs; this will save you from having to wrote deeply nested code (`doc.items[0].inputs[3].value[0].value`)

`T.form.Get(doc, 'consent')`

Other helper function are available:

- T.user: userService
- T.case: caseService

## Development in Tangerine Preview

Developers can use [Tangerine-Preview]([url](https://github.com/Tangerine-Community/Tangerine/tree/main/tangerine-preview)
) as a test environment when developing custom case reports.  When updating the version of a query in the queries.js file, run the following commands in the Chrome Dev Console to make Tangerine-Preview run the documents through the new version of the query:

```
var userdb = await T.user.getUserDatabase()
await T.update.updateCustomViews(userDb)
```




