class ElementCollection extends Backbone.ChildCollection

  model: Element

  comparator: (a, b) ->
#    return 1 unless a.has("order")
#    parseInt(a.get("order")) - parseInt(b.get("order"))
    model.get "name"