const emit = (key, value?:any) => {
  return true;
}

export const SYNC_DOCS = [
  {
    _id: '_design/sync-conflicts',
    views: {
      'sync-conflicts': {
        map: function (doc) {
          if (doc._conflicts) {
            emit(true)
          }
        }.toString()
      }
    }
  },
  {
    _id: '_design/sync-queue',
    views: {
      'sync-queue': {
        map: function (doc) {
          if (doc.collection === 'TangyFormResponse') {
            let needsUploading = (!doc.tangerineSyncedOn || doc.tangerineSyncedOn < doc.tangerineModifiedOn) ? true : false
            let formId = doc.form.id
            let isComplete = doc.complete
            emit([needsUploading, formId, isComplete], true)
          }
        }.toString()
      }
    }
  }
]