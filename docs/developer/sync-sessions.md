# Sync Sessions

A deviceToken, which is persisted in the client device record, is used for authentication with the server and is passed 
in the syncSessionUrl by sync.service. This is passed using the following code:

```ts
const syncSessionInfo = <SyncSessionInfo>await this.http.get(`${syncDetails.serverUrl}sync-session-v2/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`).toPromise()
```

The syncSessionService.start() method verifies the token, starts a sync session, and returns the following object:

```ts
<SyncSessionInfo>{
        syncSessionUrl: `${config.protocol}://${syncUsername}:${syncPassword}@${config.hostName}/db/${groupId}`,
        deviceSyncLocations: device.syncLocations
      }
```

This syncSessionUrl is used to create the connection to the Couchdb for replication.







