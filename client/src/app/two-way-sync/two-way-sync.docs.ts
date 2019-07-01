const emit = (key, value = '') => {
  return true;
}

export const TWO_WAY_SYNC_DEFAULT_USER_DOCS = [
  {
    _id: '_design/two-way-sync_conflicts',
    views: {
      'two-way-sync_conflicts': {
        map: function (doc) {
          if (doc._conflicts) {
            emit(true)
          }
        }.toString()
      }
    }
  } 
]