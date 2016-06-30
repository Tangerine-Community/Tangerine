class Subtests extends Backbone.Collection
  
  model: Subtest
  pouch:
    viewOptions:
      key : 'subtest'


  comparator: (subtest) ->
    if subtest.has("curriculumId")
      return (parseInt(subtest.get("part"))*100) + parseInt(subtest.get("order"))
    else
      return parseInt(subtest.get("order"))

  # call this after you load the collection you're going to be working with
  ensureOrder: ->
    test = (model.get("order") for model in @models).join("")
    ordered = (i for model,i in @models).join("")
    if test != ordered
      for subtest, i in @models
        subtest.set "order", i
        subtest.save()
  
