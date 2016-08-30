class Critiques extends Backbone.ChildCollection

  model: Critique

  pouch:
    viewOptions:
      key : 'critique'

  comparator: (a, b) ->
    return 1 unless a.has("order")
    parseInt(a.get("order")) - parseInt(b.get("order"))
