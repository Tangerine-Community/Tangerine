(function(doc) {
  var isRightCollection, notArchived;
  isRightCollection = doc.collection === "curriculum" || doc.collection === "assessment";
  notArchived = !(doc.archived === true || doc.archived === "true");
  if (isRightCollection && notArchived) {
    return emit(doc._id, null);
  }
});
