# Sync Protocol 2 (two-way sync)

## Background

When Tangerine was originally created, devices would only use a one-way sync from the tablet to the server [sync-protocol-1 doc](./sync-protocol-1.md). Sync Protocol 2 was developed to enable two-way sync; typically, all data from the tablet is pushed to the server, and - in order to conserve bandwidth - only data from some forms is pulled to the tablet. 

The form responses that are synced depend on which forms are configured for sync and limited to a grouping by the "location" field in that users' profile.

For example: An installation has two Forms, Form A and Form B. Only Form A is configured to sync. User A who has "facility 1" assigned to them in their user profile creates a form response for Form A and Form B then initiates a sync to find that two form responses have been pushed up. User B has "facility 1" assigned to them in their user profile and initiates a sync to find they pulled down one form response for Form A that originated on User A's device. If User B modifies this form response, it will be pushed on the next sync and then later User A would pull down the change. Let's say there is a User C who is assigned to "facility 2" in their user profile. When they initiate a sync, they will not receive any form responses from the server because the server only has form responses from User A who is assigned to "facility 1".

## Enabling Sync Protocol 2 for new Groups

!!! note 
    Sync Protocol 2 is usually automatically enabled for new groups; however, these instructions show how to manually configure it.

1. Enable Sync Protocol 2 before creating a new group by editing `config.sh` by adding `"sync-protocol-2"` to `T_MODULES`. 
2. Create a new group.
3. Define location list levels and content in `Config -> Location List`. 
4. Create a new form in `Author -> Forms`.
5. Go to `Deploy -> Device Users` and create new Device Users.
6. Go to `Deploy -> Devices` and create new Devices. 
7. Go to `Deploy -> Releases` and release the app.


`"syncProtocol":"2"` Enables a "Device Setup" process on first boot of the client application. This requires you set up a "Device" record on the server. When setting up a Device record on the server, it will give you a QR code to use to scan from the tablet in order to receive its device ID and token.

## Upgrade an existing group to Sync Protocol 2
If planning to use ``"syncProtocol":"2"` and a project already uses `"centrallyManagedUserProfile" : true`, remove `"centrallyManagedUserProfile": true` and configure the user profile's custom sync settings to push. 

## Managing Data Conflicts
Because we can sync data down to Devices, it's possible for two Devices to edit the same data between syncs. This causes a "Data Conflict". It's important for someone to monitor conflicts to ensure data integrity. Please refer to [Managing Data Conflicts](managing-data-conflicts.md) documentation.

## Modes and stages of Sync Protocol 2.

There are two different modes of sync: 

- Initial device setup: After a device has been registered (on tablet), the initial sync is executed. The initial sync has 3 stages: 
  - Pull: It pulls documents from the server in batches, set by initialBatchSize from app-config.json (default: 1000). No documents are pushed, since no data collection has happened so far. 
  - Status uploaded: Status of this sync process is uploaded.
  - Database optimization: After this initial sync, database indexes are created an optimized, which takes a little while. These indexes are critical to the app's performance.
  
- Routine sync: After a short period of data collection, the user executes an Online sync. This sync has 4 stages:
  - Pull: Pull any new or updated documents from the server. 
  - Push: Pushes any documents created on the tablet
  - Status uploaded: Status of this sync process is uploaded.
  - Database optimization: Indexes are updated. 

## Sync settings in app-config.json

Here are the settings that may be modified in app-config.json for sync:
- initialBatchSize = (default: 1000) Number of documents downloaded in the first sync when setting up a device.
- batchSize (default: 200) - Number of documents downloaded upon each subsequent sync.
- writeBatchSize = (default: 50) - Number of documents written to the tablet during each sync batch.
- changes_batch_size = (default: 50) - Enables support for reducing the number of documents processed in the changed feed when syncing. This setting will help sites that experience crashes when syncing or indexing documents. Using this setting *will* slow sync times.

If the tablet user logs in as "admin", she may access the "Admin Configuration" menu. The "Pull all docs from the server" feature enables "catching up" any documents that were missed in previous syncs. This resets a placeholder variable ("since") to 0, causing the replication API to replicate any documents or updated documents that are not on the tablet. This feature uses the "initialBatchSize" setting to download larger batches of documents. 

If users report errors during sync, consider reducing these settings. The "writeBatchSize" is the most critical setting because it manages how many documents are written to the database at a time. If the batch is too large, the sync may fail.

## Security

A big part of using Sync Protocol 2 is embracing device configuration into the workflow. Sync Protocol 2 is more than just sync: it also provides the structure for encrypting a database. A mobile device must be registered in Tangerine before it may sync. The "Deploy / Devices" page enables registration of a device. Device registration creates a key (for encrypting the db), token(for sync authentication with the server), and other identifiers associated with that device. The admin then scans a QR code for the device's registration that installs the device record (which includes the key) in the device's tangerine-lock-boxes IndexedDB database (see [LockBoxService](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/shared/_services/lock-box.service.ts)), and is used to encrypt the Tangerine databases. A user's username and password are used to decrypt the lockbox. 
 - See [db.factory](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/shared/_factories/db.factory.ts) to see how a key is passed in to encrypt a db.
 - See [sync.service](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/sync/sync.service.ts) to see how deviceToken is used for authentication in the syncSessionUrl.

