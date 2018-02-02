var couchapp = require('couchapp')
    , path = require('path');

  ddoc = {
      _id: '_design/app'
    , views: {}
    , lists: {}
    , shows: {} 
  }

  module.exports = ddoc;

  ddoc.views.byType = {
    map: function(doc) {
      emit(doc.type, null);
    },
    reduce: '_count'
  }

  ddoc.views.peopleByName = {
    map: function(doc) {
      if(doc.type == 'person') {
        emit(doc.name, null);
      }
    }
  }
  
  ddoc.views.profileByEmail = {
    map: function(doc) {
      if(doc.collection == 'profile' && doc.email) {
        emit(doc.email, null);
      }
    }
  }
  
  ddoc.views.profileByUsername = {
    map: function(doc) {
      if(doc.collection == 'profile' && doc.username) {
        emit(doc.username, null);
      }
    }
  }
  
  ddoc.views.profileByUrl = {
    map: function(doc) {
      if(doc.collection == 'profile' && doc.url) {
        emit(doc.url, null);
      }
    }
  }

  ddoc.views.billingByUsername = {
    map: function(doc) {
      if(doc.collection == 'bill' && doc.username) {
        emit(doc.username, doc);
      }
    }
  }

  ddoc.views.urlByEmail = {
    map: function(doc) {
      if(doc.collection == 'profile' && doc.email) {
        emit(doc.email, doc.url);
      }
    }
  }