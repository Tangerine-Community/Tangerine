class Questions extends Backbone.Collection

  model : Question
  url   : "question"
  db:
    view: "questionsByAssessmentId"

  comparator: (subtest) ->
    subtest.get "order"

  # call this after you load the collection you're going to be working with
  maintainOrder: ->
    test = (model.get("order") for model in @models).join("")
    ordered = (i for model,i in @models).join("")
    if test != ordered
      for subtest, i in @models
        subtest.set "order", i
        subtest.save()
