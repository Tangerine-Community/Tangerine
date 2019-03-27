// Stub emit function to please TS.
const emit = (key, value = '') => {
  return true;
}

export const SharedQueries = {
  conflicts: {
    map: function (doc) {
      if (doc._conflicts) {
        emit(true)
      }
    }.toString()
  }
}
