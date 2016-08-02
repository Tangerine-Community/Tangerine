class Elements extends Backbone.Collection
  
  model: Element
  pouch:
    viewOptions:
      key : 'element'


  comparator: (element) ->
    return parseInt(element.get("order"))

  # call this after you load the collection you're going to be working with
  ensureOrder: ->
    test = (model.get("order") for model in @models).join("")
    ordered = (i for model,i in @models).join("")
    if test != ordered
      for element, i in @models
        element.set "order", i
        element.save()
  
