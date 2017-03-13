# Workflows
A workflow is a mechanism that can string together multiple Assessments. This is useful for when you would otherwise have to create a lot of the same subtests over and over again in Assessments. Instead, create Assessments as smaller modules that you can then include in a Workflow as a Workflow Step.

## Enabling Workflows in Editor
- Create a group in Editor using a user with role of "manager". This is at least your User1 user you set up in `config.sh`.
- Go to Futon at `/db/_utils/index.html`, click on your group's database, and then click on the `settings` document.
- Change `"showWorkflows"` to `true` (without quotes), click on the checkmark for the field, and then click save to save the document.
- Now go back to editor, navigate to your group and you will find at the bottom of your group a "Workflows" section where you can create new workflows.

## Adding custom Trip Validation logic
No UI for this yet. Add JSON to your Workflow documents via Futon at `/db/_utils/index.html`. 

Example: 
```
   ...
   "tripValidation": {
       "enabled": true,
       "constraints": {
           "timeOfDay": {
               "endTime": {
                   "hour": 15
               },
               "startTime": {
                   "hour": 8
               }
           },
           "duration": {
               "minutes": 20
           }
       }
   },
   ...
```
