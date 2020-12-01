# Global Variables

Tangerine-specific variables are available in the `T` global variable. These are exposed in app.component.ts. Example:

```
this.window.T = {
      form: {
        Get: Get
      },
      router,
      http,
      user: userService,
      lockBox: lockBoxService,
      syncing: syncingService,
      syncCouchdbService: syncCouchdbService, 
      sync: syncService,
      appConfig: appConfigService,
      update: updateService,
      search: searchService,
      device: deviceService,
      tangyFormsInfo: tangyFormsInfoService,
      tangyForms: tangyFormService,
      formTypes: formTypesService,
      case: caseService,
      cases: casesService,
      caseDefinition: caseDefinitionsService,
      languages: languagesService,
      variable: variableService,
      classForm: classFormService,
      classDashboard: dashboardService,
      translate: window['t']
    }
```

Additional T properties may be added in other parts of the Tangerine codebase. 

## Usage

Examples of T global usage are throughout these docs, but here are a few:

To load and query the client database with options to get a specific revision:

```
const db = await T.user.getUserDatabase()
db.get('foo',{rev:'4-uuid', latest:false})
```

When writing queries or organizing the javascript logic to fetch the results, use the globally-exposed T.form.Get function to get the value of inputs; this will save you from having to wrote deeply nested code (`doc.items[0].inputs[3].value[0].value`)

`T.form.Get(doc, 'consent')`


```javascript
// 3 ingredients are needed to set an Event Variable.
const eventId = '123'
const variableName = 'foo'
const variableValue = 'bar'

// Set Event Variable.
T.case.setVariable(`${eventId}-${variableName}`, variableValue)

// Get Event Variable.
const shouldBeValueOfBar = T.case.getVariable(`${eventId}-${variableName}`)
```
