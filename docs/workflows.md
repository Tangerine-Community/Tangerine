

## Adding custom Trip Validation logic
No UI for this yet. Add JSON to your Workflow documents. 

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
