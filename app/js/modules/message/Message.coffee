class Message extends Backbone.Model
  url: 'message'
  
  defaults:
    "to"   : "admin"
    "from" : "nobody"
    "content" : "content"
    "timestamp" : 0
  
  initialize: ->

  