# Globals in Tangerine

## Globals in memory

In-memory globals won't survive refreshing the browser. 

We are caching important configuration files (app-config.json, forms.json, location-list.json) to avoid having to keep fetching those docs from the db.

Use the following code to take advantage of this caching:
      - `await this.appConfigService.getLocationList();`
      - `await this.tangyFormsInfoService.getFormsInfo();`
      - `await this.appConfigService.getAppConfig;`
      - `await this.tangyFormService.getFormMarkup(this.eventFormDefinition.formId);`
    
CaseDefinitionsService also has implements of caseDefinitions, but that is not exposed publicly. More info in this PR: https://github.com/Tangerine-Community/Tangerine/pull/1991

## Globals that are stored in a database

Database variables will persist after page refreshes or app reboots.

Use VariableService. Stores data in 'tangerine-variables' pouchdb as a key/value pair. The key is the _id in the doc. The value can be a string, JSON object, or any other data type that can be persisted in a pouchdb. 

```js
await this.variableService.set('tangerine-device-is-registered', true)
```

```js
await this.variableService.get('tangerine-device-is-registered')
```

## Widely-used Configuration Variables

### Server

They are not globals, but they are mighty useful. The TangerineConfigService provides variables set in config.sh. Expose it in your constructor:

```js
private readonly configService: TangerineConfigService,
```
And then you may use it:

```js
const userOneUsername = this.configService.config().userOneUsername
```

### Client

Use `await this.appConfigService.getAppConfig;` to fetch app-config.json settings in client.
