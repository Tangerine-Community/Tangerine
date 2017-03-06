function (doc) {
  var noRoles = ! doc.roles;
  if ( noRoles ) {
    return;
  }

  for (var i = 0, len = doc.roles.length; i < len; i++) {
    emit(doc.roles[i], doc.name);
  }
}