class Student extends Backbone.Model

  url : "student"

  defaults :
    gender  : "Not entered"
    age     : "Not entered"
    name    : "Not entered"
    klassId : null

  initialize: ->