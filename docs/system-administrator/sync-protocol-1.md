# Sync Protocol 1

## Background

Sync protocol 1 was the original sync protocol for Tangerine that features a one-way push sync to a server. 

## Configuration

### config.sh

Make sure that 'sync-protocol-2' is not listed in T_MODULES.

The value for T_UPLOAD_TOKEN must match the value for 'uploadToken' in the group's app-config.json.

### app-config.json

The value for 'uploadToken' must match the value for T_UPLOAD_TOKEN in config.sh.

uploadUnlockedFormReponses - when set to true this populates a list of doc_ids from responsesUnLockedAndNotUploaded view 
to be uploaded - even if doc.complete === false. This value is used mostly in projects Tangerine Class/Teach, where students are tested over time.

## Syncing

Sync in sync-protocol-1 is very simple: if queries a view to check what docs satisfy this criteria: `!doc.uploadDatetime || doc.lastModified > doc.uploadDatetime)`
If `uploadUnlockedFormReponses` is set, it includes docs where complete === false.







