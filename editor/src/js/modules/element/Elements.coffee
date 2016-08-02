class Elements extends Backbone.Collection

  model : Element
  url : "element"
  db:
    view: "byParentId"

  comparator : (model) ->
    parseInt(model.get("order"))

  initialize: (options) ->

  fetch: (options) ->
    super options

# call this after you load the collection you're going to be working with
  ensureOrder: ->
    test = (model.get("order") for model in @models).join("")
    ordered = (i for model,i in @models).join("")
    if test != ordered
      for element, i in @models
        element.set "order", i
        element.save()
