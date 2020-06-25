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

You may create a group for testing using the `create-group` command. See the [creating clean dev conntent](../developer/creating-clean-dev-content.md) doc for more information. There is a case-module option that creates generic case forms. You may also use your own custom group forms. 

Case generation uses a case-export.json file placed in the group directory as the template for record generation. To create this json file, generate a PWA and create a new case. While viewing the case, open the javascript console and use the `copy(await this.caseService.export())` command to copy the json. Then paste this data into a case-export.json file. Please note that come groups, such as created by the case-module mentioned earlier, already have a case-export.json file; however, you may be testing for different scenarios so feel free to create your own. 

Create or modify the load-testing-definitions.json file if you have different variable substitutions. Here is an example:

```json
[
  {
    "type": "caseDoc"
  },
  {
    "type": "demoDoc",
    "formId": "registration-role-1",
    "substitutions": {
      "first_name": "firstname",
      "last_name": "surname"
    }
  }
]
```

In this example, there are two files that can have variable substitution:
- caseDoc - This is the case manifest, which has the doc.type === 'case'. 
- demoDoc - This is the demographics form that corresponsd to the formId, which is "registration-role-1" in the example. 

Since the current case-module example does not have any substitutions happening in the caseDoc inpputs, there are no entries for substitutions in it. The demoDoc does have substitutions. The substitutions are key/value pairs. The substitutions key is the variable name of the input you wish to substitute, and the substitutions value  is the pre-built randomised field you wish to substitute. In this example, first_name is being replaced with the firstname randomised field. 

Case generation also performs other types of randomization. Here are som eexamples:
- firstname = Randomises a female first name 
- surname = Randomizes a last name
- tangerineModifiedOn = tangerineModifiedOn
- day = day
- month = month
- year = year
- date = date
- participant_id = participant_id
- participantUuid = participantUuid

Before generating cases, create a device registration in order to properly generate a location property in the generated docs. Sync won't work properly otherwise. 

To generate cases, use the following docker command:
        
```
docker exec tangerine generate-cases 1 group-uuid
```

This would generate one case.

## Clean things up

To delete all generated records (but keep the views), use [bulkdelete](https://github.com/chrisekelley/scripts).
