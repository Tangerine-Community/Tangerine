# Sync Protocol 1

Sync protocol 1 is deprecated as of 12-15-2022. We strongly recommend using Sync protocol 2, which is more secure. 

## Background

Sync protocol 1 was the original sync protocol for Tangerine that features a one-way push sync to a server. 

## Configuration

### config.sh

- T_MODULES: Make sure that 'sync-protocol-2' is *not* listed in T_MODULES.
- T_UPLOAD_TOKEN: The value for T_UPLOAD_TOKEN must match the value for 'uploadToken' in the group's app-config.json.
- T_UPLOAD_WITHOUT_UPDATING_REV : A config.sh setting for use in high-load instances using sync-protocol-1.
  *** Using this setting COULD CAUSE DATA LOSS. ***
  This setting uses a different function to process uploads that does not do a GET before the PUT in order to upload a document.
  Please note that if there is a conflict it will copy the _id to originalId and POST the doc, which will create a new id.
  If that fails, it will log the error and not upload the document to the server, but still send an 'OK' status to client.
  The failure would result in data loss.

### app-config.json

- uploadTokenThe value for 'uploadToken' must match the value for T_UPLOAD_TOKEN in config.sh.
- uploadUnlockedFormReponses - when set to true this populates a list of doc_ids from responsesUnLockedAndNotUploaded view 
to be uploaded - even if doc.complete === false. This value is used mostly in projects Tangerine Class/Teach, where students are tested over time.

## Syncing

Sync in sync-protocol-1 is very simple: if queries a view to check what docs satisfy this criteria: `!doc.uploadDatetime || doc.lastModified > doc.uploadDatetime)`
If `uploadUnlockedFormReponses` is set, it includes docs where complete === false.







