var express = require('express');
var router = express.Router();

router.use('/api/generateDbDump/:groupId/:deviceId/:syncUsername/:syncPassword', async function(req, res, next){
  const groupId = req.params.groupId;
  const deviceId = req.params.deviceId;
  const syncUsername = req.params.syncUsername;
  const syncPassword = req.params.syncPassword;
  const url = `http://${syncUsername}:${syncPassword}@couchdb:5984/${groupId}`
  const devicesUrl = `http://${syncUsername}:${syncPassword}@couchdb:5984/${groupId}-devices`
  console.log("about to generateDbDump to " + groupId + " deviceId: " + deviceId + " syncUsername: " + syncUsername)
  const groupDevicesDb = await new PouchDB(devicesUrl)
  const device = await groupDevicesDb.get(deviceId)
  const formInfos = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
  let locations;
  if (device.syncLocations.length > 0) {
    locations = device.syncLocations.map(locationConfig => {
      // Get last value, that's the focused sync point.
      let location = locationConfig.value.slice(-1).pop()
      return location
    })
  }
  const pullSelector = {
    "$or": [
      ...formInfos.reduce(($or, formInfo) => {
        if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
          $or = [
            ...$or,
            ...device.syncLocations.length > 0 && formInfo.couchdbSyncSettings.filterByLocation
              ? device.syncLocations.map(locationConfig => {
                // Get last value, that's the focused sync point.
                let location = locationConfig.value.slice(-1).pop()
                return {
                  "form.id": formInfo.id,
                  [`location.${location.level}`]: location.value
                }
              })
              : [
                {
                  "form.id": formInfo.id
                }
              ]
          ]
        }
        return $or
      }, []),
      ...device.syncLocations.length > 0
        ? device.syncLocations.map(locationConfig => {
          // Get last value, that's the focused sync point.
          let location = locationConfig.value.slice(-1).pop()
          return {
            "type": "issue",
            [`location.${location.level}`]: location.value,
            "resolveOnAppContext": AppContext.Client
          }
        })
        : [
          {
            "resolveOnAppContext": AppContext.Client,
            "type": "issue"
          }
        ]
    ]
  }
 
  const replicationOpts = {
    "selector": pullSelector
  }
  // stream db to express response
  const db = new PouchDB(url);
 
  let dbDumpFileDir = `/tangerine/groups/${groupId}/client/dbDumpFiles`
 
  for (const location of locations) {
    // locations: [{"location.region":"B7BzlR6h"}]
    const locationIdentifier = `${location.level}_${location.value}`
    let dbDumpFilePath = `${dbDumpFileDir}/${sanitize(locationIdentifier)}-dbDumpFile`
    let metadataFilePath = `${dbDumpFileDir}/${sanitize(locationIdentifier)}-metadata`
    try {
      await fs.ensureDir(dbDumpFileDir)
    } catch (err) {
      console.error(err)
    }
   
    const exists = await fs.pathExists(dbDumpFilePath)
    if (! exists) {
      console.log("dbDumpFilePath not created; generating.")
      const stream = new MemoryStream()
      let dbDumpFileWriteStream = fsc.createWriteStream(dbDumpFilePath)
      let metadataWriteStream = fsc.createWriteStream(metadataFilePath)
      console.log("Now dumping to the writeStream")
      let i = 0
      stream.on('data', function (chunk) {
        // chunks.push(chunk)
        console.log("on dbDumpFileReadStream")
        dbDumpFileWriteStream.write(chunk.toString());
        if (i === 0) {
          try {
            const firstChunk = chunk.toString();
            const ndjObject = JSON.parse(firstChunk)
            console.log("firstChunk: " + firstChunk)
            let payloadDocCount, pullLastSeq
            if (ndjObject) {
              payloadDocCount = ndjObject.db_info?.doc_count;
              pullLastSeq = ndjObject.db_info?.update_seq;
              const responseObject = {
                "payloadDocCount": payloadDocCount,
                "pullLastSeq": pullLastSeq,
                "locationIdentifier": sanitize(locationIdentifier)
              }
              metadataWriteStream.write(JSON.stringify(responseObject));
            }
           
          } catch (e) {
            console.log("firstChunk ERROR: " + e)
          }
        }
        i++
        // writeStream.write(chunk);
      });
      // await db.dump(dbDumpFileWriteStream, replicationOpts).then(async () => {
      await db.dump(stream, replicationOpts).then(async () => {
        console.log('Dump from db complete!')
        console.log('Sleep for 2 seconds')
        await sleep(2000);
        // const dbDumpFileReadStream = fs.createReadStream(dbDumpFilePath)
        metadataWriteStream.end()
        dbDumpFileWriteStream.end()
      }).catch(function(err){
        // res.status(500).send(err);
        console.trace()
        res.send({ statusCode: 500, data: "Error dumping database to file: " + err })
        reject("Error dumping database to file: " + err)
      });
      console.log('dumpedString from db complete!')
    }
    console.log('sending metadata')
    fs.createReadStream(metadataFilePath).pipe(res);
  }
});

router.use('/api/getDbDump/:groupId/:locationIdentifier', async function(req, res, next){
  const groupId = req.params.groupId;
  const locationIdentifier = req.params.locationIdentifier;
  let dbDumpFileDir = `/tangerine/groups/${groupId}/client/dbDumpFiles`
  let dbDumpFilePath = `${dbDumpFileDir}/${locationIdentifier}-dbDumpFile`
  const exists = await fs.pathExists(dbDumpFilePath)
  if (exists) {
    console.log("Transferring the dbDumpFile to locationIdentifier: " + locationIdentifier)
    fs.createReadStream(dbDumpFilePath).pipe(res);
  } else {
    res.send({ statusCode: 404, data: "DB dump file not found. "})
  }
});

module.exports = router;