class KlassResults extends Backbone.Collection

  url: "result"
  model: KlassResult

  initialize: (options = {}) ->
    unless options.showOld? && options.showOld == true
      @on "all", (event) =>
        toRemove = []
        for result in @models
          toRemove.push result.id if result.has("old")
        for resultId in toRemove
          @remove(resultId, silent: true) 
