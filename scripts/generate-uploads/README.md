


Usage:
```
npm install
./bin.js <delayBetweenBatchesInMilliseconds> <batchSize> <numberOfUploads> <url>
```

Get some test data by uploading 4 field-demo form responses into group-1:
```
./bin.js 1000 4 4 http://localhost/upload/group-1
```

Stress the server by uploading 100 form responses every 15 seconds for 1000 total uploads:
```
./bin.js 15000 100 1000 http://localhost/upload/group-1
```


