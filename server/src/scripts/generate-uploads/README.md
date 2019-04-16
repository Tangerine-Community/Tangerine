# Generate-uploads

This script creates 2 docs for each iteration of the batch - an example doc and a user-profile doc. 


Usage:
```
npm install
./bin.js<numberOfUploads> <groupName> [delayBetweenBatchesInMilliseconds] [batchSize] [alternativeTemplate]
```

Get some test data by uploading 4 field-demo form responses into group-1:
```
./bin.js 4 group-1
```

Stress the server by uploading 100 form responses every 15 seconds in batches of 10
```
./bin.js 100 group-1 15000 10
```

If you want to use an alternate tamplate, name it using filename format 'template-alternativeTemplate-doc.js'
(substituting alternativeTemplate for the name) and add alternativeTemplate to the end of the params.
```
./bin.js 100 foo 2000 5 class
```

## Testing logstash modue


The lgostash reporting module will attempt to attach the related user-profile to the example doc, using the example doc's userProfileId. 
If you are using this script to test logstash output, it may not find its related user-profile because the user-profile doc may not 
have been processed by logstash yet. 

Example of attached user-profile:

```
    "user-profile._id": "user-7c66edc0-5173-11e9-afce-6ddd698d4789",
    "user-profile._rev": "5-5ba9a57c95900032439b9177fc925774",
    "user-profile.formId": "user-profile",
    "user-profile.startDatetime": "2018-05-31T19:46:12.180Z",
    "user-profile.startUnixtime": 1527795972180,
    "user-profile.processedResult": {
      "_id": "user-7c66edc0-5173-11e9-afce-6ddd698d4789",
      "formId": "user-profile",
      "startUnixtime": 1527795972180,
      "complete": "",
      "first_name": "Jimmy",
      "last_name": "Foo",
      "gender": "Male",
      "phone": "5551212",
      "test": "on"
    },
```


