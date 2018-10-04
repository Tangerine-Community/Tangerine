


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

If you want to use an alternate teample, name it using filename format 'template-alternativeTemplate-doc.js'
(substituting alternativeTemplate for the name) and add alternativeTemplate to the end of the params.
```
./bin.js 100 foo 2000 5 class
```


