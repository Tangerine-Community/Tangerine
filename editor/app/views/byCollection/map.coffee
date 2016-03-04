(doc) -> emit(doc.collection, { "r" : doc._rev }) if doc.collection
