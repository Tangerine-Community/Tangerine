class Critique extends Backbone.ChildModel

  url: "critique"

  initialize: ->

  shouldShowNotes: ->
    @getString("showNotes") == "true" or @getString("showNotes") == true