# Load testing

## Client-side testing

Generate a PWA. Go to any case record and enter the following in the js console:

```js
this.caseService.generateCases(1)
```
You may change the number of cases generated. It uses the current case as a template for the generated cases. 
TODO: Use the case-export.json in the group.

You can check how many docs are in the db with:

```js
this.userService.getSharedDBDocCount()
```

Select "Sync Online" to test syncing a large recordset.

## Server-side generation

One may populate a vanilla Tangerine instance with records using the cli:

```
docker exec tangerine generate-uploads 500 group-uuid 2000 100
```

That command generates 500 sets (each of which has 2 records) in batches of 100, posted every 2000 ms. Each doc are generated from templates in server/src/scripts/generate-uploads.

Add the 'class' switch to the end of that command will generate a studentRegistrationDoc in addition to the other 2 docs. (Read server/src/scripts/generate-uploads/bin.js for more details.)

You may need to modify the templates to suit the docs you wish to generate.

### Case generation

Case generation uses a case-export.json file placed in the group directory as the template for record generation. 

Generate a PWA, create a new case. While still in the case, use the `copy(await this.caseService.export())` command to copy the json into a case-export.json file. 

By the way - you may create a group for testing using the `create-group` command. See the [creating clean dev conntent](../developer/creating-clean-dev-content.md) doc for more information. 

To generate cases, use the following docker command:
        
```
docker exec tangerine generate-cases 1 group-uuid
```

This would generate one case.

## Clean things up

To delete all generated records (but keep the views), use [bulkdelete](https://github.com/chrisekelley/scripts).
