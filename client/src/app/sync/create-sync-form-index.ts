export const createSyncFormIndex = async (db, formInfos) => {

  // const formInfos = await this.tangyFormsInfoService.getFormsInfo()
  
  function getFormIdsForSync() {
    return [
      ...formInfos.reduce(($formIds, formInfo) => {
        if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
          $formIds = [
            ...$formIds,
            ...[
              formInfo.id
            ]
          ]
        }
        return $formIds
      }, [])
    ]
  }

  const formIds = getFormIdsForSync()
  const map = `
    function(doc) {
      const formIds = ${JSON.stringify(formIds)}
      if (doc.collection === 'TangyFormResponse') {
       if (doc.items &&
               Array.isArray(doc.items) &&
               doc.form &&
               doc.form.id) {
        if (formIds.includes(doc.form.id)) {
         emit(doc.form.id, doc._id)
        }
       }
      }
    }
  `
  const doc = {
    _id: '_design/sync-formids',
    views: {
      'sync-formids': {
        map
      }
    }
  }
  try {
    const existingSyncFormIdsDoc = await db.get('_design/sync-formids')
    doc['_rev'] = existingSyncFormIdsDoc._rev
  } catch (e) { }
  await db.put(doc)
}
